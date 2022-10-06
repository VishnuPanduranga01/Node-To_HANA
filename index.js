const express = require("express");
const app = express();
const hdb = require("hdb");
const xsenv = require("@sap/xsenv");
const { JWTStrategy } = require("@sap/xssec");
const passport = require("passport");
const port = process.env.port || 8080;

const xsenvObj = xsenv.getServices({ hana: { tag: "database" } });
const xsenvObjXSUAA = xsenv.getServices({uaa:{tag:"xsuaa"}});

passport.use(new JWTStrategy(xsenvObjXSUAA.uaa));
app.use(passport.initialize());
app.use(passport.authenticate("JWT",{session:false}));

const hdiConfig = { 
    "host": xsenvObj.hana.host,
    "port": xsenvObj.hana.port,
    "user": xsenvObj.hana.user,
    "password": xsenvObj.hana.password,
    "useTLS": true
};

const hanaClinet = hdb.createClient(hdiConfig);

hanaClinet.on("error", (err) => {
    console.log("Connection to HANA db failed because of ", err);
});

app.get("/Employee", getVEmployees);

function getVEmployees(req, res) {
    hanaClinet.connect((err) => {
        if (err) {
            res.send("there is error");
        }
        else {
            hanaClinet.exec(`select * from ${xsenvObj.hana.schema}.DEMO`,
                function (err, rows) {
                    hanaClinet.end();
                    if (err) {
                        console.log("there is a error");
                        res.send("There is connection error")
                    }
                    else {
                        res.send(rows);
                    }
                }
            )
        }
    })

}

app.listen(port, () => {
    console.log("app is listening on " + port)
});