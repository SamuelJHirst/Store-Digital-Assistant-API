describe('Update Product Quantities', function() {
    let set = 3;
    let inc = 2;
    let dec = 1;

    beforeEach(() => {
        cy.fixture('products/newProduct').as('newProduct').then(function(data) {
            this.ean = data.ean;
        });
        cy.fixture('sites/newSite1').as('newSite1').then(function(data) {
            this.code = data.code;
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

    it('Set Valid Product Quantity', function() {
        cy.request({
            method: 'PUT',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            body: { method: 'set', quantity: set },
            headers: this.headers,
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.all.keys('_id', 'product', 'site', 'quantity');
            expect(response.body.product.ean).to.equal(this.ean);
            expect(response.body.site.code).to.equal(this.code);
            expect(response.body.quantity).to.equal(set);
        });
    });

    it('Increment Valid Product Quantity', function() {
        cy.request({
            method: 'PUT',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            body: { method: 'increment', quantity: inc },
            headers: this.headers,
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.all.keys('_id', 'product', 'site', 'quantity');
            expect(response.body.product.ean).to.equal(this.ean);
            expect(response.body.site.code).to.equal(this.code);
            expect(response.body.quantity).to.equal(set + inc);
        });
    });

    it('Decrement Valid Product Quantity', function() {
        cy.request({
            method: 'PUT',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            body: { method: 'decrement', quantity: dec },
            headers: this.headers,
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.all.keys('_id', 'product', 'site', 'quantity');
            expect(response.body.product.ean).to.equal(this.ean);
            expect(response.body.site.code).to.equal(this.code);
            expect(response.body.quantity).to.equal(set + inc - dec);
        });
    });

    it('Set Product Quantity Without Authentication', function() {
        cy.request({
            method: 'PUT',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            body: { method: 'set', quantity: set },
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Set Product Quantity Without Body', function() {
        cy.request({
            method: 'PUT',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Set Product Quantity With Invalid Quantity', function() {
        cy.request({
            method: 'PUT',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            body: { method: 'set', quantity: 'ABC' },
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Set Product Quantity With Invalid EAN', function() {
        cy.request({
            method: 'PUT',
            url: '/products/ABC/quantity/' + this.code,
            body: { method: 'set', quantity: set },
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    });

    it('Set Product Quantity With Invalid Site', function() {
        cy.request({
            method: 'GET',
            url: '/products/' + this.ean + '/quantity/ABC',
            body: { method: 'set', quantity: set },
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    });
});