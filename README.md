
# Ticketing System Project

![Logo](assets/images/logo.png)

## Introduction
This project is a **Ticketing System** designed for creating, managing, and resolving tickets in an organization. It features machine learning-based category prediction and supports multiple user roles including **Admins**, **Agents**, and **Users**. The system is built using **Node.js**, **Express**, and **Python**, with email integration for ticket notifications.

![Ticketing System](assets/images/image.png)

## Architecture Overview
The system uses a **client-server** architecture, with the backend managing ticket creation. Python is used for the machine learning model, while Node.js serves as the backend for handling requests and managing user roles. The architecture also includes MariaDB for database management and Google OAuth2 for email notifications.

**Architecture Diagram:**
- Node.js for API and routing.
- Python (with scikit-learn) for category prediction.
- MariaDB for storing tickets, users, and categories.
- Google OAuth2 for email integration.

The system includes a **RESTful API** for interacting with the backend and a **web interface** for users to create and manage tickets. The machine learning model predicts ticket categories based on the description provided by the user.

The system supports multiple user roles, including **Admins** who can manage users, agents, and categories, **Agents** who can claim, respond to, and resolve tickets, and **Users** who can create and track their tickets.

The image below shows the database schema for the ticketing system (ER diagram):

![Architecture Diagram](assets/images/ticket-db.png)

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

   # Google OAuth2 for email (SSO integration) 
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # For sending email notifications (SMTP)
   AUTH_MAIL_ADDRESS=your_email@gmail.com
   AUTH_PASSWORD_MAIL=your_email_password
   
   # Port for the Node.js server (default is 1337) 
   GOOGLE_REDIRECT_URI=http://localhost:1337/auth/google/callback
   HOST=localhost:1337


   ```
### Setting Up Email Integration with Google

1. In your Google Cloud Console, set up OAuth2 credentials for your application. (https://console.cloud.google.com)
2. Get your `Client ID` and `Client Secret` following this guide: [Google OAuth2 for Email](https://developers.google.com/identity/protocols/oauth2).
3. Copy the `.env` file above (what it should look like) and create it in the root directory of the repository.
4. Fill in your credentials in the `.env` file.



### Step 4: Resetting the Database
You need to reset the database (don't worry, there is a script that does it all for you). All you need to do is:

1. From the root directory of the Ticketing System, navigate into the `scripts` folder:
   ```bash
   cd scripts
   ```
2. Run the reset script:
   ```bash
   node reset.js
   ```

This will reset your database to its default state and regenerate the CSV file.


### Step 5: Running the Application

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

### Predefined Accounts and Roles
The system includes three predefined accounts with different roles for testing and demonstration purposes. Each role has specific access and permissions:

- **Super Admin**:  
  - Login Credentials:  
    `username: admin`  
    `password: admin`  
  - **Role and Access**: The Super Admin has the highest level of access in the system and can perform all administrative tasks. This includes creating and managing users, agents, and categories, as well as having full control over tickets and settings.

- **Agent**:  
  - Login Credentials:  
    `username: agent`  
    `password: agent`  
  - **Role and Access**: The Agent can claim, respond to, and resolve tickets. They can also update ticket statuses and assign categories but do not have permissions to manage other users or system-wide settings.

- **User**:  
  - Login Credentials:  
    `username: user`  
    `password: user`  
  - **Role and Access**: The User has minimal access and can only create and view their own tickets. They can also attach files and track the status of their tickets but do not have administrative privileges.


### Development

To automate starting both the Python and Node.js servers, use the `start_servers.sh` script:

```bash
.\start_servers.sh
```

This script starts both the Python ML server and the Node.js server for you.

