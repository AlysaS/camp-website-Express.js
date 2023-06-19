
var express= require('express');
var url = require('url');
var mysql = require('mysql');
var nodemailer= require('nodemailer');


var app = express();

////use pug as template engine
app.set('view engine', 'pug');

//tell express where static files are located
app.use(express.static(__dirname + '/public'));


 //connect to database
    var conn = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "camp_summer"
    });

    conn.connect(function(err){
         if (err) throw err;
    }); 

//Route for user:

//Home page- passed in an array so that the initial page will be the home page, 
//and the user can click the home button to get to the home page 
app.get(['/','/home'],function(req,res){
    res.render('home', {title: 'Home'});
});

//Contact Camper
app.get('/contact_camper',function(req,res){
    
    res.render('contact_camper', {title: 'Contact Camper', sent:false});
});

//contact camper success
app.get('/contact_camper_success',function(req,res){
    res.render('contact_camper',  {title: 'Contact Camper', sent:true});
});

//Deals with contact camper form after it is sumbitted
app.get('/contact_camper_submission', function(req,res){
    addMessage(req,res,conn);
});

//contact office
app.get('/contact_office',function(req,res){
    res.render('contact_office', {title:'Contact Office', sent:false});
});

//deals with contact office form after it is submitted
app.get('/contact_office_submission', function(req,res){
    var q = url.parse(req.url, true);
    var query = q.query;
    sendEmail(query.name, query.email, query.message, res);
});

//contact office success
app.get('/contact_office_success',function(req,res){
    res.render('contact_office', {title:'Contact Office', sent:true});
});

//veiw staff contact information 
app.get('/staff_info', function(req,res){
    var information = [];
    
    var sql= "Select * FROM staff_info ORDER BY lastName ASC";
    conn.query(sql,function(err,results, fields){
        if (err) throw err;
        
        
        //put results into the inforamtion array 
        for(var i = 0; i < results.length; i++){
  
            var staff = {
     
            firstName: results[i].firstName, 
            lastName: results[i].lastName,
            job: results[i].job,
            camp_email: results[i].camp_email 
            }
        information[i] = staff;
        };
        
     res.render('staff_info',{title:'Staff Info',info:information}); 
     
  });
});
   


var server= app.listen(8000, function(){});





function addMessage(req, res, conn){
     //get data user entered and insert it into the database table 
     var q = url.parse(req.url, true);
    
    
        var query = q.query;
        var fname = query.fname;
        var lname = query.lname;
        var grade = query.grade;
        var bunk = query.bunk;
        var urgent = query.urgent;
        var message = query.message;
        
        
        var sql = "INSERT INTO contact_camper (firstName, lastName, grade, bunk, urgent, message) VALUES (?,?,?,?,?,?)";
        
        conn.query(sql,[fname,lname,grade,bunk,urgent,message], function(err, result){
            if (err){
                throw err;
          
            }
            res.redirect('/contact_camper_success');
            
        });
    };
    
    
    
    
function sendEmail(name, email, message, res){
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'YOUR EMAIL',
        pass: 'PASSWORD'
    }
    });

    var mailOptions = {
    from: 'YOUR EMAIL',
    to: 'YOUR EMAIL',
    subject: 'Message From Website',
    html: '<b>From: </b>' + name + '<br><b>Email: </b>' + email +
            '<br><b>Message: </b>' + message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error){
           console.log(error);
        }else{
          console.log('Email sent: ' + info.response);
        }
    });
    
    
    res.redirect('/contact_office_success');
};
