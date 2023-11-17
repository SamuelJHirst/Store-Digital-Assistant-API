describe('Update Products', function() {
    beforeEach(() => {
        cy.fixture('products/newProduct').as('newProduct').then(function(data) {
            this.ean = data.ean;
        });
        cy.fixture('products/updateProduct').as('updateProduct').then(function(data) {
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
    
    it('Update Product With Valid Data', function() {
        cy.request({
            method: 'PATCH',
            url: '/products/' + this.ean,
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('ean', this.ean);
            expect(response.body).to.have.all.keys('_id', 'name', 'ean', 'price', 'description', 'status', 'ageRestricted', 'info');
        });
    });

    it('Update Product Without Authentication', function() {
        cy.request({
            method: 'PATCH',
            url: '/products/' + this.ean,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Update Product Without Body', function() {
        cy.request({
            method: 'PATCH',
            url: '/products/' + this.ean,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Update Product With Invalid Price', function() {
        this.body.price = 'ABC';
        cy.request({
            method: 'PATCH',
            url: '/products/' + this.ean,
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Update Product With Invalid Status', function() {
        this.body.status = 'ABC';
        cy.request({
            method: 'PATCH',
            url: '/products/' + this.ean,
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Update Product With Invalid Age Restriction', function() {
        this.body.ageRestricted = 'ABC';
        cy.request({
            method: 'PATCH',
            url: '/products/' + this.ean,
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });
});