describe('Get Sites', function() {
    beforeEach(() => {
        cy.fixture('sites/newSite1').as('newSite1').then(function(data) {
            this.body = data;
        });
    });

    it('Get All Sites', function() {
        cy.request({
            method: 'GET',
            url: '/locations',
            headers: this.headers,
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.map(x => { return x.code; })).to.include(this.body.code);
            for (const obj of response.body) {
                expect(obj).to.have.all.keys('_id', 'name', 'code', 'type');
            }
        });
    });

    it('Get Valid Site', function() {
        cy.request({
            method: 'GET',
            url: '/locations/' + this.body.code,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('code', this.body.code);
            expect(response.body).to.have.all.keys('_id', 'name', 'code', 'type');
        });
    });

    it('Get Invalid Site', function() {
        cy.request({
            method: 'GET',
            url: '/locations/ABC',
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    });
});