'use strict';
import { config } from 'dotenv';
config();
import express from 'express';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import apiRoutes from './routes/api.js';
import fccTestingRoutes from './routes/fcctesting.js';
import runner from './test-runner.js';
import { swaggerSpec } from './swagger.js';
import swaggerUi from 'swagger-ui-express';

// Helmet
import {
    hidePoweredBy,
    frameguard,
    xssFilter,
    noSniff,
    ieNoOpen,
    contentSecurityPolicy,
} from 'helmet';

const app = express();

// Helmet
app.use(hidePoweredBy());
app.use(frameguard());
app.use(xssFilter());
app.use(noSniff());
app.use(ieNoOpen());
app.use(
    contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https: 'unsafe-inline'"],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        },
    })
);

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Index page (static HTML)
app.route('/').get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
// eslint-disable-next-line no-unused-vars
app.use(function (req, res, next) {
    res.status(404).type('text').send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + listener.address().port);
    if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
            try {
                runner.run();
            } catch (e) {
                var error = e;
                console.log('Tests are not valid:');
                console.log(error);
            }
        }, 3500);
    }
    // swaggerDocs(app, listener.address().port);
});

export default app; //for testing
