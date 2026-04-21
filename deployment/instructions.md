# Deployment Instructions (Ubuntu 24.04 LTS)

1. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install apache2 mysql-server python3-pip python3-venv libapache2-mod-wsgi-py3 nodejs npm
   ```

2. **Database Setup**
   ```bash
   sudo mysql -u root < database/schema.sql
   ```

3. **Backend Service Setup**
   ```bash
   # Move backend
   sudo cp -r backend /var/www/npm-pro/
   cd /var/www/npm-pro/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   *Create systemd service for Flask app or run via WSGI.*

4. **Frontend Build**
   ```bash
   cd frontend
   npm install
   npm run build
   sudo cp -r dist /var/www/npm-pro/frontend/
   ```

5. **Apache Configuration**
   ```bash
   sudo a2enmod proxy proxy_http rewrite
   sudo cp deployment/npm-pro.conf /etc/apache2/sites-available/
   sudo a2ensite npm-pro.conf
   sudo systemctl restart apache2
   ```

6. **Permissions**
   Ensure database user permissions and file permissions. Connect to `http://npm-pro.local` or map server IP in `/etc/hosts/`.
