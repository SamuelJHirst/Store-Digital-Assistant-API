describe('Create Sites', function() {
    beforeEach(() => {
        cy.fixture('sites/newSite1').as('newSite1').then(function(data) {
            this.body = data;
        });
        cy.request({
            method: 'POST',
            url: '/authenticate',
            body: {
                username: Cypress.env('USERNAME'),
                password: Cypress.env('PASSWORD')
            }
        }).then(function(response) {
            this.headers = {
                Authorization: response.body.token
            }
        });
    });
    
    it('Create Valid New Site', function() {
        cy.request({
            method: 'POST',
            url: '/locations',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('code', this.body.code);
            expect(response.body).to.have.all.keys('_id', 'name', 'code', 'type');
        });
    });

    it('Create Another Valid New Site', function() {
        cy.fixture('sites/newSite2').as('newSite2').then(function(data) {
            cy.request({
                method: 'POST',
                url: '/locations',
                headers: this.headers,
                body: data,
                failOnStatusCode: false
            }).should(function(response) {
                expect(response.status).to.eq(201);
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('code', data.code);
                expect(response.body).to.have.all.keys('_id', 'name', 'code', 'type');
            });
        });
    });

    it('Create Duplicate Site', function() {
        cy.request({
            method: 'POST',
            url: '/locations',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(409);
        });
    });

    it('Create Site Without Authentication', function() {
        cy.request({
            method: 'POST',
            url: '/locations',
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Create Site Without Body', function() {
        cy.request({
            method: 'POST',
            url: '/locations',
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Create Site With Invalid Code 1', function() {
        this.body.code = 'ABC';
        cy.request({
            method: 'POST',
            url: '/locations',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Create Site With Invalid Code 2', function() {
        this.body.code = 10000;
        cy.request({
            method: 'POST',
            url: '/locations',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Create Site With Invalid Type', function() {
        this.body.type = 'ABC';
        cy.request({
            method: 'POST',
            url: '/locations',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });
});