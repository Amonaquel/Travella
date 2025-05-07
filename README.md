Travella is a full-stack travel planning application built to simplify how we plan trips. Whether you're a backpacker or a vacation perfectionist, 
Travella helps you explore new places, organize day-by-day itineraries, and manage your bookings—all in one smooth experience.
It’s built with modern tools, designed to be responsive, and focuses on making travel planning as enjoyable as the trip itself.

Features
Here’s a closer look at what Travella offers and how each part works:
1. Destination Discovery
You can browse a curated list of destinations, complete with travel tips, key attractions, and points of interest. This makes it easy to get inspired if you’re not sure where to go next—or learn more about places you already have in mind.

2. Itinerary Planning
Once you’ve chosen your destination, Travella lets you build a day-by-day itinerary. You can add activities, rearrange them freely, and map out your trip in a structured way. It’s designed to be flexible and intuitive, so you can focus on the fun parts of planning.

3. Booking System
The booking section allows users to select and reserve accommodations or activities directly through the platform. While this may start with mock data or simple forms, it’s structured in a way that can be easily expanded to real-time booking integrations later.

4. User Authentication
User authentication is handled securely to protect personal data. New users can register, log in, and return later to find their plans saved and ready to go. The system is built with token-based authentication for security and scalability.

5. Responsive Design
Travella works well on both desktop and mobile. Whether you're lounging on the couch with a tablet or sneaking in some planning time on your phone, the interface adjusts to keep everything accessible and user-friendly.

Getting Started
This section walks you through how to set up the project locally so you can explore or contribute to it.
Prerequisites
Here’s what you need and why we use it:

Node.js: We use Node for both frontend tooling (via npm) and our backend server. It’s fast, lightweight, and has a massive ecosystem that helps us build more with less.

npm (Node Package Manager): Comes with Node, and it’s what we use to install all the libraries and frameworks that power Travella. It manages everything from backend packages to frontend build tools.

MongoDB: This NoSQL database is flexible, fast, and stores our data in a JSON-like format. It’s perfect for managing users, itineraries, and bookings in a scalable way.

Git: While not mandatory for running the app, it's essential if you're planning to collaborate or keep track of your own version history.

.env File Setup: You’ll need to create a .env file to manage secrets like your database URI and authentication tokens without hardcoding them.

ScreenShots : 

![image-12f5adf9-fc36-4004-8444-609a2091b77c](https://github.com/user-attachments/assets/a552b283-09d0-439b-8eb0-8d1d7fe4438e)
This code displays a login form with two input fields: one for email and one for password. When the user submits the form, it triggers a login function. If there is an error (like wrong credentials), an error message appears. There are also links to sign up or reset your password. The form is styled with CSS classes for a clean, centered card layout.

![image](https://github.com/user-attachments/assets/80246d7f-b65f-4040-a3d2-88ae38bb273b)
This code handles POST requests to /api/schedules by taking the request data, converting the start and end dates to Date objects, and saving a new schedule to the database. If successful, it returns the saved schedule; if there’s an error, it logs the issue and returns an error message.

![image](https://github.com/user-attachments/assets/59f64f8f-bd76-40e0-98bf-db57de4913b3)
This code defines a backend API endpoint that handles POST requests to /api/get-currency. When a request is received with a city name in the request body, it constructs a prompt asking for the local currency used in that city and requests the answer from the Cohere AI API. The API call is made with specific parameters (like model, prompt, and headers including an API key), and the expected response should be a JSON object containing the currency and its code. This allows the server to dynamically fetch currency information for any city using an AI-powered language model.

![image-547cb957-26c9-4f23-b6c1-5f712e59c0c4](https://github.com/user-attachments/assets/19a42098-32ac-4791-977c-5a67f02a2737)
This code handles errors that occur during the signup process in a React application. If an error is caught, it logs the error to the console and then checks the error code to determine the specific issue. Depending on the error code, it sets a user-friendly error message using setError, such as notifying the user if the email is already in use, the email address is invalid, email/password accounts are not enabled, or the password is too weak. If the error code doesn't match any known cases, it sets a generic error message. Finally, regardless of the outcome, it sets the loading state to false to indicate that the signup process has finished.


![image-829b2969-6700-4562-b63e-960312f03fb9](https://github.com/user-attachments/assets/3d975c9e-2282-45a5-92a6-832e3f8a2e20)
This code renders a section of a React component that displays a list of available activities using drag-and-drop functionality, likely for building a travel schedule. It uses the DragDropContext and Droppable components from a drag-and-drop library to allow users to move activities around. If the data is still loading, it shows a loading message; if there are no activities, it displays a message indicating none are available. Otherwise, it maps over the activities array and renders each activity as a draggable item, showing its name, price, currency, and category. This interactive UI lets users visually organize and select activities for their schedule by dragging and dropping them.



