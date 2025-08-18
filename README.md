# PaySplitz - Group Expense Tracking Application

## Project Overview

PaySplitz is a comprehensive group expense tracking application that allows users to create groups, add expenses, and automatically calculate who owes money to whom. The application features smart settlement calculations to minimize the number of transactions needed to settle debts between group members

## Features
- **Create and Manage User Groups** – Organize users into groups to manage shared expenses.
- **Track Group Expenses** – Record shared expenses and settle balances easily.
- **Analytical Insights** – Visualize spending trends with interactive graphs.
- **Secure Authentication** – JSON Web Tokens (JWT) for secure access.

## Technologies Used

This project was built using the following technologies:

### Frontend
- **React JS** – For building the user interface
- **Axios** – For making API calls
- **Material UI** – For UI components and styling
- **Chart.js** – To display various analytics graphs
- **React-chartjs-2** – React wrapper for Chart.js
- **Gravatar** – For user profile pictures

### Backend
- **Express** – Web framework for Node.js
- **Mongoose** – MongoDB object modeling for Node.js
- **JWT (JSON Web Token)** – For authentication
- **bcryptjs** – For encrypting sensitive data

### Database
- **MongoDB** – NoSQL database (MongoDB Atlas)

## Configuration and Setup

To run this project locally, follow these steps:

1. **Clone the repository**  
  clone the repository, or download it as a ZIP and extract it on your machine.

2. **Open the project**  
   Open the project in your code editor (e.g., VS Code).

3. **Open terminal**  
   Go to `Terminal -> New Terminal` (if using VS Code).  
   Split your terminal into two: one for the client, one for the server.

---
### **Setup Client**
```bash
cd client
npm install      # Install client-side dependencies
npm start        # Start the client

### For Backend
-create a .env file in the root of your directory.
-Add your crediantials
PORT=3001
MONGODB_URI=
ACCESS_TOKEN_SECRET=


