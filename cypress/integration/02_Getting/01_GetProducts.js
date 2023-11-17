describe('Get Products', function() {
    beforeEach(() => {
        cy.fixture('products/newProduct').as('newProduct').then(function(data) {
            this.body = data;
        });
    });

    it('Get All Products', function() {
        cy.request({
            method: 'GET',
            url: '/products',
            headers: this.headers,
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.map(x => { return x.ean; })).to.include(this.body.ean);
            for (const obj of response.body) {
                expect(obj).to.have.all.keys('_id', 'name', 'ean', 'price', 'description', 'status', 'ageRestricted', 'info');
            }
        });
    });

    it('Get Valid Product', function() {
        cy.request({
            method: 'GET',
            url: '/products/' + this.body.ean,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('ean', this.body.ean);
            expect(response.body).to.have.all.keys('_id', 'name', 'ean', 'price', 'description', 'status', 'ageRestricted', 'info');
        });
    });

    it('Get Invalid Product', function() {
        cy.request({
            method: 'GET',
            url: '/products/ABC',
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    });
});