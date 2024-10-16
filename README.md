
# Ticketing System Project

This is a comprehensive ticketing system built using **Node.js**, **Express**, and **Python**. The system allows users to create, manage, and resolve tickets.

## Features
- Users can create, update, and resolve tickets.
- Machine learning model predicts ticket categories based on the description.
- Admins can manage users, agents, and categories.
- Agents can claim, respond to, and resolve tickets.
- Support for file attachments (e.g., images, documents).
- Automated ticket classification using a machine learning model.

## Installation

### Requirements
Ensure you have the following installed on your system:
- **Node.js** (v14 or higher)
- **Python** (v3.7 or higher)
- **MariaDB** (or any MySQL-compatible database)

### Step 1: Clone the Repository

Start by cloning the project repository to your local machine:

```bash
git clone https://github.com/AIlhomov/Ticketing-System.git
cd Ticketing-System
```

### Step 2: Setting Up Python

1. **Create a virtual environment** (optional but recommended for isolating dependencies):
   ```bash
   python -m venv env
   source env/bin/activate
   ```

2. **Install the required Python libraries**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Python machine learning server** (in a separate terminal):
   ```bash
   python scripts/app.py
   ```

### Step 3: Setting Up Node.js

1. **Install the necessary Node.js packages**:
   ```bash
   npm install
   ```

2. **Set up Nodemon** (a tool for automatically restarting the server during development):
   ```bash
   npm install -g nodemon
   ```

3. **Create a `.env` file** at the root of your project. This file will contain your database configuration. Below is an example of what your `.env` file should look like:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ticket

   # Google OAuth2 for email
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token
   AUTH_MAIL_ADDRESS=your_email@gmail.com

   GOOGLE_REDIRECT_URI=http://localhost:1337/auth/google/callback
   HOST=localhost:1337


   ```
### Setting Up Email Integration with Google

1. In your Google Cloud Console, set up OAuth2 credentials for your application.
2. Get your `Client ID`, `Client Secret`, and `Refresh Token` following this guide: [Google OAuth2 for Email](https://developers.google.com/identity/protocols/oauth2).
3. Copy the `.env.example` file and rename it to `.env`.
4. Fill in your credentials in the `.env` file.

### Step 4: Running the Application

1. **Start the Python machine learning server** (run it from `scripts/app.py` in a separate terminal):
   ```bash
   python scripts/app.py
   ```

2. **Run the Node.js server** using the following command:
   ```bash
   npm run dev
   ```

The application should now be running at:
[http://localhost:1337/](http://localhost:1337/)

### Step 5: Testing the Application

1. Visit [http://localhost:1337/](http://localhost:1337/) to interact with the ticketing system.
2. You can register as a user, log in as an admin or agent, and create tickets.
### Development

To automate starting both the Python and Node.js servers, use the `start_servers.sh` script:

```bash
bash start_servers.sh
```

This script starts both the Python ML server and the Node.js server for you.
