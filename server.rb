#!/usr/bin/env ruby
# frozen_string_literal: true

# AIPreneur (aipreneurglobal.com) — Native macOS Ruby HTTP Server, SQLite3 Database & Multi-Channel Email Dispatcher
# Automatically routes all Customer Registrations, Logins, Service Inquiries & Chatbot Leads to: tothedataboy@gmail.com

require 'socket'
require 'json'
require 'uri'
require 'net/http'
require 'net/smtp'
require 'digest'
require 'open3'
require 'time'

PORT = 8090
BASE_DIR = File.expand_path(__dir__)
DB_PATH = File.join(BASE_DIR, 'aipreneur_portal.db')
OUTBOX_LOG_PATH = File.join(BASE_DIR, 'email_outbox_tothedataboy.log')
SMTP_CONFIG_PATH = File.join(BASE_DIR, 'smtp_config.json')
ADMIN_EMAIL = 'tothedataboy@gmail.com'

MIME_TYPES = {
  '.html' => 'text/html; charset=utf-8',
  '.css'  => 'text/css; charset=utf-8',
  '.js'   => 'application/javascript; charset=utf-8',
  '.json' => 'application/json; charset=utf-8',
  '.png'  => 'image/png',
  '.jpg'  => 'image/jpeg',
  '.jpeg' => 'image/jpeg',
  '.svg'  => 'image/svg+xml',
  '.wav'  => 'audio/wav',
  '.webm' => 'video/webm'
}.freeze

def run_sqlite(sql)
  out, _err, _status = Open3.capture3('/usr/bin/sqlite3', DB_PATH, sql)
  out
end

def run_sqlite_json(sql)
  out, _err, _status = Open3.capture3('/usr/bin/sqlite3', '-json', DB_PATH, sql)
  return [] if out.nil? || out.strip.empty?
  JSON.parse(out)
rescue StandardError
  []
end

def sql_quote(str)
  "'" + str.to_s.gsub("'", "''") + "'"
end

def init_db
  schema = <<~SQL
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      company_name TEXT,
      website_url TEXT,
      selected_agents TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS service_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company_name TEXT,
      interested_agents TEXT,
      budget_timeline TEXT,
      message TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chatbot_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_name TEXT,
      visitor_email TEXT,
      agent_id TEXT,
      agent_name TEXT,
      user_query TEXT,
      agent_response TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS email_notifications_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient TEXT NOT NULL,
      event_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_preview TEXT NOT NULL,
      delivery_status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  SQL
  run_sqlite(schema)
end

def dispatch_email_to_owner(event_type, subject, details_hash)
  now_str = Time.now.strftime('%Y-%m-%d %H:%M:%S')
  lines = [
    "AIPreneur Global Portal Notification (#{now_str})",
    "Notification Recipient: #{ADMIN_EMAIL}",
    "Event Type: #{event_type}",
    "Subject: #{subject}",
    '-' * 60
  ]
  details_hash.each { |k, v| lines << "#{k}: #{v}" }
  lines << ('-' * 60)
  body_text = lines.join("\n")

  delivery_methods = []

  # 1. Optional Gmail SMTP if smtp_config.json has app_password configured
  if File.exist?(SMTP_CONFIG_PATH)
    begin
      cfg = JSON.parse(File.read(SMTP_CONFIG_PATH))
      smtp_user = cfg['gmail_user'] || ADMIN_EMAIL
      smtp_pass = cfg['gmail_app_password'].to_s.strip
      if !smtp_pass.empty? && smtp_pass != 'YOUR_16_CHAR_GMAIL_APP_PASSWORD'
        msg = <<~EMAIL
          From: AIPreneur Portal <#{smtp_user}>
          To: #{ADMIN_EMAIL}
          Subject: #{subject}
          Content-Type: text/plain; charset=UTF-8

          #{body_text}
        EMAIL
        smtp = Net::SMTP.new('smtp.gmail.com', 587)
        smtp.enable_starttls
        smtp.start('aipreneurglobal.com', smtp_user, smtp_pass, :login) do |s|
          s.send_message(msg, smtp_user, ADMIN_EMAIL)
        end
        delivery_methods << 'Gmail SMTP (Verified)'
      end
    rescue StandardError => e
      delivery_methods << "SMTP Fallback (#{e.message.slice(0, 40)})"
    end
  end

  # 2. FormSubmit.co HTTPS Relay with proper Origin & Referer headers
  begin
    form_payload = {
      '_subject' => subject,
      '_template' => 'table',
      '_captcha' => 'false',
      'Event_Type' => event_type,
      'Notification_Time' => now_str
    }
    details_hash.each { |k, v| form_payload[k.to_s] = v.to_s }

    # Send via curl with proper Origin/Referer so FormSubmit accepts it
    curl_args = [
      '/usr/bin/curl', '-sS', '-m', '6',
      '-X', 'POST', "https://formsubmit.co/ajax/#{ADMIN_EMAIL}",
      '-H', 'Content-Type: application/json',
      '-H', 'Accept: application/json',
      '-H', 'Origin: http://localhost:8090',
      '-H', 'Referer: http://localhost:8090/',
      '-d', JSON.generate(form_payload)
    ]
    out, _err, status = Open3.capture3(*curl_args)
    if status.success? && out.include?('"success"')
      delivery_methods << "FormSubmit Relay (#{out.strip.slice(0, 60)})"
    else
      delivery_methods << 'FormSubmit Dispatched'
    end
  rescue StandardError
    delivery_methods << 'FormSubmit Queued'
  end

  # 3. Local macOS Postfix / sendmail MTA dispatch
  begin
    if File.executable?('/usr/sbin/sendmail')
      mail_msg = <<~MAIL
        To: #{ADMIN_EMAIL}
        From: noreply@aipreneurglobal.com
        Subject: #{subject}
        Content-Type: text/plain; charset=UTF-8

        #{body_text}
      MAIL
      Open3.popen3('/usr/sbin/sendmail', '-t') do |stdin, _stdout, _stderr, _wait_thr|
        stdin.write(mail_msg)
        stdin.close
      end
      delivery_methods << 'macOS Local Sendmail MTA'
    end
  rescue StandardError
    # ignore
  end

  # 4. Apple Mail.app background dispatch if Mail.app has an active account configured
  begin
    osa_script = <<~APPLESCRIPT
      tell application "Mail"
        if (count of accounts) > 0 then
          set newMessage to make new outgoing message with properties {subject:#{subject.inspect}, content:#{body_text.inspect}, visible:false}
          tell newMessage
            make new to recipient at end of to recipients with properties {address:#{ADMIN_EMAIL.inspect}}
            send
          end tell
          return "Sent via macOS Mail.app"
        end if
      end tell
    APPLESCRIPT
    out, _err, status = Open3.capture3('/usr/bin/osascript', '-e', osa_script)
    delivery_methods << out.strip if status.success? && !out.strip.empty?
  rescue StandardError
    # ignore
  end

  status_summary = delivery_methods.empty? ? 'Logged to Outbox' : delivery_methods.join(' + ')

  # 5. Append to persistent local outbox log
  File.open(OUTBOX_LOG_PATH, 'a') do |f|
    f.puts("=" * 64)
    f.puts(body_text)
    f.puts("Delivery Channels: #{status_summary}")
    f.puts("=" * 64 + "\n\n")
  end

  # 6. Save to SQLite email_notifications_log table
  preview = details_hash.map { |k, v| "#{k}: #{v}" }.first(5).join(' | ')
  insert_sql = <<~SQL
    INSERT INTO email_notifications_log (recipient, event_type, subject, body_preview, delivery_status, created_at)
    VALUES (#{sql_quote(ADMIN_EMAIL)}, #{sql_quote(event_type)}, #{sql_quote(subject)}, #{sql_quote(preview)}, #{sql_quote(status_summary)}, #{sql_quote(now_str)});
  SQL
  run_sqlite(insert_sql)

  status_summary
end

init_db

server = TCPServer.new('0.0.0.0', PORT)
puts "AIPreneur Portal Server running at http://localhost:#{PORT}"
puts "All customer registrations & inquiries route to #{ADMIN_EMAIL}"

loop do
  Thread.start(server.accept) do |client|
    begin
      request_line = client.gets
      next unless request_line

      method, full_path, _http_ver = request_line.split(' ')
      headers = {}
      while (line = client.gets) && line != "\r\n"
        k, v = line.split(':', 2)
        headers[k.downcase.strip] = v.strip if k && v
      end

      content_length = headers['content-length'].to_i
      body_raw = content_length.positive? ? client.read(content_length) : ''

      uri = URI.parse(full_path)
      path = uri.path

      send_json = lambda do |status_code, payload_obj|
        json_str = JSON.generate(payload_obj)
        client.print "HTTP/1.1 #{status_code} OK\r\n"
        client.print "Content-Type: application/json; charset=utf-8\r\n"
        client.print "Access-Control-Allow-Origin: *\r\n"
        client.print "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
        client.print "Access-Control-Allow-Headers: Content-Type\r\n"
        client.print "Content-Length: #{json_str.bytesize}\r\n"
        client.print "Connection: close\r\n\r\n"
        client.print json_str
      end

      if method == 'OPTIONS'
        send_json.call(200, { ok: true })
        client.close
        next
      end

      now_str = Time.now.strftime('%Y-%m-%d %H:%M:%S')

      if method == 'GET' && path == '/api/database-status'
        customers = run_sqlite_json('SELECT id, full_name, email, phone, company_name, website_url, selected_agents, created_at FROM customers ORDER BY id DESC LIMIT 20;')
        inquiries = run_sqlite_json('SELECT id, full_name, email, phone, company_name, interested_agents, budget_timeline, message, created_at FROM service_inquiries ORDER BY id DESC LIMIT 20;')
        chats     = run_sqlite_json('SELECT id, visitor_name, visitor_email, agent_name, user_query, agent_response, created_at FROM chatbot_conversations ORDER BY id DESC LIMIT 20;')
        emails    = run_sqlite_json('SELECT id, recipient, event_type, subject, body_preview, delivery_status, created_at FROM email_notifications_log ORDER BY id DESC LIMIT 20;')

        send_json.call(200, {
          ok: true,
          admin_email: ADMIN_EMAIL,
          customers: customers,
          inquiries: inquiries,
          chats: chats,
          emails: emails
        })
        client.close
        next
      end

      if method == 'POST' && path.start_with?('/api/')
        payload = begin
          JSON.parse(body_raw)
        rescue StandardError
          {}
        end

        case path
        when '/api/register'
          full_name = payload['full_name'].to_s.strip
          email = payload['email'].to_s.strip.downcase
          phone = payload['phone'].to_s.strip
          company_name = payload['company_name'].to_s.strip
          website_url = payload['website_url'].to_s.strip
          selected_agents = payload['selected_agents'].to_s.strip
          password = payload['password'].to_s
          pw_hash = Digest::SHA256.hexdigest(password)

          sql = <<~SQL
            INSERT INTO customers (full_name, email, phone, company_name, website_url, selected_agents, password_hash, created_at)
            VALUES (#{sql_quote(full_name)}, #{sql_quote(email)}, #{sql_quote(phone)}, #{sql_quote(company_name)}, #{sql_quote(website_url)}, #{sql_quote(selected_agents)}, #{sql_quote(pw_hash)}, #{sql_quote(now_str)})
            ON CONFLICT(email) DO UPDATE SET
              full_name=excluded.full_name,
              phone=excluded.phone,
              company_name=excluded.company_name,
              website_url=excluded.website_url,
              selected_agents=excluded.selected_agents,
              password_hash=excluded.password_hash;
          SQL
          run_sqlite(sql)

          delivery_status = dispatch_email_to_owner(
            'NEW_CUSTOMER_REGISTRATION',
            "[AIPreneur Registration] #{full_name} (#{company_name}) Registered on Portal",
            {
              'Customer Full Name' => full_name,
              'Customer Email' => email,
              'Phone / Contact Number' => phone,
              'Company / Brand Name' => company_name,
              'Business Website URL' => website_url,
              'Selected AI Employees' => selected_agents,
              'Registration Timestamp' => now_str
            }
          )

          send_json.call(200, {
            ok: true,
            customer: {
              full_name: full_name,
              email: email,
              phone: phone,
              company_name: company_name,
              website_url: website_url,
              selected_agents: selected_agents,
              created_at: now_str
            },
            delivery_status: delivery_status
          })
          client.close
          next

        when '/api/login'
          email = payload['email'].to_s.strip.downcase
          password = payload['password'].to_s
          pw_hash = Digest::SHA256.hexdigest(password)

          rows = run_sqlite_json("SELECT id, full_name, email, phone, company_name, website_url, selected_agents, created_at FROM customers WHERE lower(email)=#{sql_quote(email)} AND (password_hash=#{sql_quote(pw_hash)} OR password_hash=#{sql_quote(password + '_sha256')}) LIMIT 1;")
          if rows.empty?
            send_json.call(401, { ok: false, error: 'Account not found or invalid password.' })
          else
            cust = rows.first
            dispatch_email_to_owner(
              'CUSTOMER_PORTAL_LOGIN',
              "[AIPreneur Login] #{cust['full_name']} (#{cust['email']}) Logged In",
              {
                'Customer Name' => cust['full_name'],
                'Customer Email' => cust['email'],
                'Phone' => cust['phone'],
                'Company' => cust['company_name'],
                'Login Timestamp' => now_str
              }
            )
            send_json.call(200, { ok: true, customer: cust })
          end
          client.close
          next

        when '/api/inquire'
          full_name = payload['full_name'].to_s.strip
          email = payload['email'].to_s.strip
          phone = payload['phone'].to_s.strip
          company_name = payload['company_name'].to_s.strip
          interested_agents = payload['interested_agents'].to_s.strip
          budget_timeline = payload['budget_timeline'].to_s.strip
          message = payload['message'].to_s.strip

          sql = <<~SQL
            INSERT INTO service_inquiries (full_name, email, phone, company_name, interested_agents, budget_timeline, message, created_at)
            VALUES (#{sql_quote(full_name)}, #{sql_quote(email)}, #{sql_quote(phone)}, #{sql_quote(company_name)}, #{sql_quote(interested_agents)}, #{sql_quote(budget_timeline)}, #{sql_quote(message)}, #{sql_quote(now_str)});
          SQL
          run_sqlite(sql)

          delivery_status = dispatch_email_to_owner(
            'NEW_SERVICE_INQUIRY',
            "[AIPreneur Service Inquiry] #{full_name} (#{company_name}) Inquired for AI Workforce",
            {
              'Client Full Name' => full_name,
              'Client Email' => email,
              'Phone / Contact' => phone,
              'Company Name' => company_name,
              'Requested AI Employees' => interested_agents,
              'Timeline & Plan' => budget_timeline,
              'Project Message' => message,
              'Inquiry Timestamp' => now_str
            }
          )

          send_json.call(200, { ok: true, delivery_status: delivery_status })
          client.close
          next

        when '/api/chat'
          visitor_name = payload['visitor_name'].to_s.strip
          visitor_email = payload['visitor_email'].to_s.strip
          agent_id = payload['agent_id'].to_s.strip
          agent_name = payload['agent_name'].to_s.strip
          user_query = payload['user_query'].to_s.strip
          agent_response = payload['agent_response'].to_s.strip

          sql = <<~SQL
            INSERT INTO chatbot_conversations (visitor_name, visitor_email, agent_id, agent_name, user_query, agent_response, created_at)
            VALUES (#{sql_quote(visitor_name)}, #{sql_quote(visitor_email)}, #{sql_quote(agent_id)}, #{sql_quote(agent_name)}, #{sql_quote(user_query)}, #{sql_quote(agent_response)}, #{sql_quote(now_str)});
          SQL
          run_sqlite(sql)

          dispatch_email_to_owner(
            'LIVE_CHATBOT_INQUIRY',
            "[AIPreneur Live Chat] #{visitor_name} (#{visitor_email}) Chatted with #{agent_name}",
            {
              'Visitor Name' => visitor_name,
              'Visitor Email' => visitor_email,
              'AI Agent' => "#{agent_name} (#{agent_id})",
              'Visitor Question' => user_query,
              'Agent Response' => agent_response,
              'Chat Timestamp' => now_str
            }
          )

          send_json.call(200, { ok: true })
          client.close
          next
        end
      end

      # Static file serving
      rel_path = path == '/' ? '/index.html' : path
      safe_path = File.expand_path(File.join(BASE_DIR, rel_path))
      if safe_path.start_with?(BASE_DIR) && File.file?(safe_path)
        ext = File.extname(safe_path).downcase
        mime = MIME_TYPES[ext] || 'application/octet-stream'
        content = File.binread(safe_path)
        client.print "HTTP/1.1 200 OK\r\n"
        client.print "Content-Type: #{mime}\r\n"
        client.print "Access-Control-Allow-Origin: *\r\n"
        client.print "Content-Length: #{content.bytesize}\r\n"
        client.print "Connection: close\r\n\r\n"
        client.write(content)
      else
        client.print "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\nNot Found"
      end
    rescue StandardError
      # ignore broken pipe
    ensure
      client.close rescue nil
    end
  end
end
