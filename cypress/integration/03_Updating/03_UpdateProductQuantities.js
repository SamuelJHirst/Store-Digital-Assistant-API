describe('Get Product Quantities', function() {
    beforeEach(() => {
        cy.fixture('products/newProduct').as('newProduct').then(function(data) {
            this.ean = data.ean;
        });
        cy.fixture('sites/newSite1').as('newSite1').then(function(data) {
            this.code = data.code;
        });
    });

    it('Get Valid Product Quantity', function() {
        cy.request({
            method: 'GET',
            url: '/products/' + this.ean + '/quantity/' + this.code,
            headers: this.headers,
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.all.keys('_id', 'product', 'site', 'quantity');
            expect(response.body.product.ean).to.equal(this.ean);
            expect(response.body.site.code).to.equal(this.code);
        });
    });

    it('Get Product Quantity With Invalid EAN', function() {
        cy.request({
            method: 'GET',
            url: '/products/ABC/quantity/' + this.code,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    });

    it('Get Product Quantity With Invalid Site', function() {
        cy.request({
            method: 'GET',
            url: '/products/' + this.ean + '/quantity/ABC',
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    });
});