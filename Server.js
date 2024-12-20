const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Ensure this file sets up and exports your database connection.
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check for admin credentials (hardcoded for a single admin)
    if (email === 'kpb08062004@gmail.com' && password === 'asdfg@123') {
        return res.json({
            success: true,
            role: 'admin',
            id: 1, // Admin ID (can be hardcoded or from the database)
            name: 'Admin' // Admin name
        });
    }

    // Check in tbl_stureg for normal users
    const sqlUser = 'SELECT * FROM tbl_stureg WHERE email = ?';
    db.query(sqlUser, [email], (err, data) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (data.length > 0) {
            const user = data[0];

            // Direct password comparison (plain-text comparison)
            if (password !== user.password) {
                return res.status(401).json({ success: false, message: 'Invalid Credentials!' });
            }

            // Return user data
            return res.json({
                success: true,
                role: 'user',
                id: user.id,
                name: user.name
            });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid Credentials!' });
        }
    });
});




// Change Password Endpoint
// Registration Endpoint
/*app.post('/api/students', (req, res) => {
    const { name, dob, className, department, contact, email, password } = req.body;

    if (!name || !dob || !className || !department || !contact || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO tbl_stureg (name, dob, class, department, contact, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, dob, className, department, contact, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error inserting data' });
        }

        return res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            id: result.insertId,
        });
    });
});
*/
// Registration Endpoint
app.post('/api/students', (req, res) => {
    const { name, dob, className, department, contact, email, password } = req.body;

    if (!name || !dob || !className || !department || !contact || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Remove password hashing
    const query = 'INSERT INTO tbl_stureg (name, dob, class, department, contact, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, dob, className, department, contact, email, password], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error inserting data' });
        }

        return res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            id: result.insertId,
        });
    });
});



// Add Route

// Endpoint to add a new route
app.post('/api/routes', (req, res) => {
    const { start, end, bus_fare } = req.body;

    // Validate input data
    if (!start || !end || !bus_fare) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // SQL query to insert new route into tbl_route
    const query = 'INSERT INTO tbl_route (start_route, end_route, bus_fare) VALUES (?, ?, ?)';

    // Execute the query
    db.query(query, [start, end, bus_fare], (err, result) => {
        if (err) {
            console.error('Error inserting route:', err);
            return res.status(500).json({ success: false, message: 'Error inserting route' });
        }

        // Success response
        res.json({ success: true, message: 'Route added successfully', route_id: result.insertId });
    });
});


//View Routes
app.get("/api/routes", (req, res) => {
    const sql = "SELECT route_id, start_route, end_route, bus_fare FROM tbl_route";

    console.log("Executing query:", sql); // Debugging line

    db.query(sql, (err, data) => {
        if (err) {
            console.error("Database query error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch routes",
            });
        }

        console.log("Database query result:", data); // Debugging line

        if (data.length > 0) {
            res.json({ success: true, routes: data });
        } else {
            res.json({ success: true, routes: [] });
        }
    });
});

//View Students
// Get students endpoint
app.get('/api/students', (req, res) => {
    const sql = 'SELECT id, name, email FROM tbl_stureg'; // Modify the query as needed
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch students' });
        }

        res.json(data);  // Send the student data as response
    });
});

//Delete Student
app.delete('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    
    const sqlDelete = 'DELETE FROM tbl_stureg WHERE id = ?';
    
    db.query(sqlDelete, [studentId], (err, result) => {
        if (err) {
            console.error('Error deleting student:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete student' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Student deleted successfully' });
    });
});

//Show Profile
app.get('/api/profile/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT name, department, dob ,email,contact FROM tbl_stureg WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
        }

        if (results.length > 0) {
            return res.json({ success: true, profile: results[0] });
        } else {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
    });
});


//Update Profile
app.put('/api/profile/:id', (req, res) => {
    const { id } = req.params;
    const { name, department, dob } = req.body;

    if (!name || !department || !dob) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const query = 'UPDATE tbl_stureg SET name = ?, department = ?, dob = ? WHERE id = ?';
    db.query(query, [name, department, dob, id], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update profile' });
        }

        if (results.affectedRows > 0) {
            return res.json({ success: true, message: 'Profile updated successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
    });
});


//Add Bus
// Endpoint to add a bus
app.post('/api/bus', (req, res) => {
    const { bus_number, route_id } = req.body;
  
    // Basic validation
    if (!bus_number || !route_id) {
      return res.status(400).send('Bus number and route are required');
    }
  
    const query = 'INSERT INTO tbl_bus (bus_number, route_id) VALUES (?, ?)';
    db.query(query, [bus_number, route_id], (err, result) => {
      if (err) {
        console.error('Error adding bus:', err);
        return res.status(500).send('Error adding bus');
      }
      res.status(201).send('Bus added successfully');
    });
  });



  // Endpoint to get bus details along with route names
  app.get('/api/buses', (req, res) => {
    const query = `
      SELECT b.bus_number, r.start_route, r.end_route
      FROM tbl_bus b
      JOIN tbl_route r ON b.route_id = r.route_id;
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching bus details:', err);
        return res.status(500).json({ success: false, message: 'Error fetching bus details.' });
      }
      res.json({ success: true, buses: results });
    });
  });


// Endpoint to delete a bus
app.delete('/api/bus/:bus_number', (req, res) => {
    const busNumber = req.params.bus_number;
    
    const query = 'DELETE FROM tbl_bus WHERE bus_number = ?';
  
    db.query(query, [busNumber], (err, results) => {
      if (err) {
        console.error('Error deleting bus:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete bus.' });
      }
      if (results.affectedRows > 0) {
        res.json({ success: true, message: 'Bus deleted successfully.' });
      } else {
        res.status(404).json({ success: false, message: 'Bus not found.' });
      }
    });
  });
  


// POST route to insert selected route and user ID into tbl_selbus
app.post('/api/selbus', (req, res) => {
    const { id, route_id } = req.body;

    if (!id || !route_id) {
        return res.status(400).json({ success: false, message: 'User ID and Route ID are required' });
    }

    // Insert into tbl_selbus
    const query = 'INSERT INTO tbl_selbus (id, route_id) VALUES (?, ?)';
    db.query(query, [id, route_id], (err, result) => {
        if (err) {
            console.error('Error inserting into tbl_selbus:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        return res.json({ success: true, message: 'Route selected successfully!' });
    });
});


// API route to get bus details for a student by userId
app.get('/api/view-bus-details/:id', (req, res) => {
    const userId = req.params.id; // Get the user ID from the URL parameter
  
    console.log("Fetching bus details for user ID:", userId); // Log the userId to debug
  
    const sql = `
      SELECT b.bus_number, r.start_route, r.end_route, r.bus_fare
      FROM tbl_selbus s
      JOIN tbl_bus b ON s.route_id = b.route_id
      JOIN tbl_route r ON b.route_id = r.route_id
      WHERE s.id = ?
    `;
    
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
  
      if (results.length > 0) {
        res.json({ success: true, busDetails: results });
      } else {
        res.json({ success: false, message: 'No bus details found for this user' });
      }
    });
  });

  
//insert payment
 app.post("/api/insert-payment", (req, res) => {
  const { userId, month, year, payStatus } = req.body;

  // Format month as two digits (01, 02, ..., 12)
  const formattedMonth = month < 10 ? '0' + month : month;
  
  // Create a valid pay_date (using the first day of the month)
  const payDate = `${year}-${formattedMonth}-01`; // Format: 'YYYY-MM-DD'
  // Insert into tbl_payment
  const query = "INSERT INTO tbl_payment (id, pay_month, pay_date, pay_status) VALUES (?, ?, ?, ?)";
  db.query(query, [userId, month, payDate, payStatus], (err, result) => {
    if (err) {
      console.error("Error inserting payment:", err);
      return res.status(500).json({ success: false, message: "Payment insertion failed." });
    }
    return res.status(200).json({ success: true, message: "Payment inserted successfully." });
  });
});



app.get("/api/get-payment-details", (req, res) => {
    const query = `
      SELECT s.id, s.name, s.department, p.pay_status
      FROM tbl_stureg s
      LEFT JOIN tbl_payment p ON s.id = p.id AND p.pay_status = 1
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching payment details:", err);
        return res.status(500).json({ success: false, message: "Error fetching payment details." });
      }
  
      // If the result is empty, we return an empty array, not null
      if (result.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
  
      res.status(200).json({ success: true, data: result });
    });
  });
  
  app.put("/api/change-password/:userId", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.params;

    try {
        // Fetch the user from the database
        db.query("SELECT * FROM tbl_stureg WHERE id = ?", [userId], (err, results) => {
            if (err) {
                console.error("Database query failed:", err);
                return res.status(500).json({ success: false, message: "Database query failed" });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const user = results[0];

            // Compare the current password with the stored password (plain text comparison)
            if (currentPassword !== user.password) {
                return res.status(400).json({ success: false, message: "Incorrect current password" });
            }

            // Update the password in the database (no need to hash the new password)
            db.query("UPDATE tbl_stureg SET password = ? WHERE id = ?", [newPassword, userId], (err, result) => {
                if (err) {
                    console.error("Failed to update password:", err);
                    return res.status(500).json({ success: false, message: "Failed to update password" });
                }

                return res.json({ success: true, message: "Password updated successfully" });
            });
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Your existing payment API logic (Node.js example)

  
// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
