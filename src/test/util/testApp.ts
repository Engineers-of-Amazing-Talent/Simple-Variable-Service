import express from 'express';

const testApp = express();
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true }));

export default testApp;
