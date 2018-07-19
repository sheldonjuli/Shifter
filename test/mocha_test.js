var chai = require('chai');
var server = require('../server/server');
var should = chai.should();
var expect = chai.expect;
var request = require('superagent');


describe('Api', function() {
    var basetestURL = "http://localhost:3000"
    console.log("**** Some Logs Are From The Servercode ****")
    
    it('Test if GET /api/user/e70727 is responding and giving right format', function(done) {
        request.get(basetestURL + '/api/user/e70727')
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('userId');
            expect(res.body).to.have.property('firstName');
            expect(res.body).to.have.property('middleName');
            expect(res.body).to.have.property('lastName');
            expect(res.body).to.have.property('workplaces');
            expect(res.body).to.have.property('rating');
            expect(res.body).to.have.property('email');
            expect(res.body).to.have.property('userStatus');
            expect(res.body).to.have.property('coworkers');
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
    
    it('Test if GET /api/user/history/... is responding and giving right format', function(done) {
        request.get(basetestURL + '/api/user/history/e70727?past=20')
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('events');
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
        
    it('Test if GET /api/user/notification/... is responding and giving right format', function(done) {
        request.get(basetestURL + '/api/notification/?past=20')
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('events');
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
        
    it('Test if GET /api/search/work/... is responding and giving right format', function(done) {
        request.get(basetestURL + '/api/search/work/patio')
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
        
    it('Test if GET /api/search/user/... is responding and giving right format', function(done) {
        request.get(basetestURL + '/api/search/user/tooky')
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
    
    it('Test if GET /api/logout/ is responding and giving right format', function(done) {
        request.get(basetestURL + '/api/search/user/tooky')
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            done();
        });
    });
    
    it('Test if it throws errors when given wrong url', function(done) {
        request.get(basetestURL + '/api/sadfudhsfkdshaffidsgpfou')
        .end(function assert(err, res){
            // expect to throw error
            expect(err).to.be.ok;
            done();
        });
    });
    
    it('Test if POST /api/user/ is responding and getng right format', function(done) {
        var jsonItem = {
                originator: "a1",
                username: "way",
                password: "paasasassasa",
                firstName: "Tooky",
                middleName: "Tee",
                lastName: "McTook",
                workplaces: [
                    {
                        name: "The Patio 23",
                        address: "43 Glenbarry St.\nToronto, ON, M8H2JT\nCanada"
                    },
                    {
                        name: "Oneils Pub", 
                        address: "22 Someother Avenue\nToronto, ON, M6J2TK\nCanada"
                    }
                ],
                email: "test@aol.com",
                userStatus: 1
            }
        
        request.post(basetestURL + '/api/user/e70727').send(jsonItem)
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
    
    it('Test if POST /api/user/add/ is responding and getng right format', function(done) {
        var jsonItem = {
                type: "manager",
                originator: "a1",
                username: "way",
                password: "paasasassasa",
                firstName: "Tooky",
                middleName: "Tee",
                lastName: "McTook",
                workplaces: [
                    {
                        name: "The Patio 23",
                        address: "43 Glenbarry St.\nToronto, ON, M8H2JT\nCanada"
                    },
                    {
                        name: "Oneils Pub", 
                        address: "22 Someother Avenue\nToronto, ON, M6J2TK\nCanada"
                    }
                ],
                email: "test@aol.com"
            }
        
        request.post(basetestURL + '/api/user/add/').send(jsonItem)
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
       
        it('Test if POST /api/user/add/ is responding right when format is wrong', function(done) {
        var jsonItem = {
                something: "crazy",
                going: "on"
            }
        
        request.post(basetestURL + '/api/user/add/').send(jsonItem)
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // test to have json contract properties
            expect(res.body).to.have.property('status', 0);
            expect(res.body).to.have.property('reason');
            done();
        });
    });
    
    it('Test if POST /api/work/add/ is responding and getng right format', function(done) {
        var jsonItem = {
                workname: "The Patio 23",
                userId: "e70727",
                position: "cook"
            }
        
        request.post(basetestURL + '/api/work/add/').send(jsonItem)
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('status', 1);
            expect(res.body).to.have.property('reason', '');
            done();
        });
    });
    
    it('Test if POST /api/login/ can login with wrong u&p', function(done) {
        var jsonItem = {
                username: "wrong",   
                password: "login"
            }
        
        request.post(basetestURL + '/api/login/').send(jsonItem)
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('redirect', '');
            expect(res.body).to.have.property('reason');
            done();
        });
    });
        
    it('Test if POST /api/signup/ can signup with no input', function(done) {
        var jsonItem = {
                username: "",   
                password: "",
                email: ""
            }
        
        request.post(basetestURL + '/api/signup/').send(jsonItem)
        .end(function assert(err, res){
            // expect to not trow error
            expect(err).to.not.be.ok;
            // expect to be 200
            expect(res).to.have.property('status', 200);
            // test to have json contract properties
            expect(res.body).to.have.property('redirect', '');
            expect(res.body).to.have.property('reason');
            done();
        });
    });
});
