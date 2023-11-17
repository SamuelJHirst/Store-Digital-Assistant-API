describe('Create Products', function() {
    beforeEach(() => {
        cy.fixture('products/newProduct').as('newProduct').then(function(data) {
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
    
    it('Create Valid New Product', function() {
        cy.request({
            method: 'POST',
            url: '/products',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('ean', this.body.ean);
            expect(response.body).to.have.all.keys('_id', 'name', 'ean', 'price', 'description', 'status', 'ageRestricted', 'info');
        });
    });

    it('Create Duplicate Product', function() {
        cy.request({
            method: 'POST',
            url: '/products',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(409);
        });
    });

    it('Create Product Without Authentication', function() {
        cy.request({
            method: 'POST',
            url: '/products',
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Create Product Without Body', function() {
        cy.request({
            method: 'POST',
            url: '/products',
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Create Product With Invalid Price', function() {
        this.body.price = 'ABC';
        cy.request({
            method: 'POST',
            url: '/products',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Create Product With Invalid Status', function() {
        this.body.status = 'ABC';
        cy.request({
            method: 'POST',
            url: '/products',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Create Product With Invalid Age Restriction', function() {
        this.body.ageRestricted = 'ABC';
        cy.request({
            method: 'POST',
            url: '/products',
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });
});