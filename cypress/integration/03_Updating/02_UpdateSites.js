describe('Update Sites', function() {
    beforeEach(() => {
        cy.fixture('sites/newSite1').as('newSite1').then(function(data) {
            this.code = data.code;
        });
        cy.fixture('sites/updateSite').as('updateSite').then(function(data) {
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
    
    it('Update Site With Valid Data', function() {
        cy.request({
            method: 'PATCH',
            url: '/locations/' + this.code,
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.all.keys('_id', 'name', 'code', 'type');
        });
    });

    it('Update Site Without Authentication', function() {
        cy.request({
            method: 'PATCH',
            url: '/locations/' + this.code,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Update Site Without Body', function() {
        cy.request({
            method: 'PATCH',
            url: '/locations/' + this.code,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });

    it('Update Site With Invalid Type', function() {
        this.body.type = 'ABC';
        cy.request({
            method: 'PATCH',
            url: '/locations/' + this.code,
            headers: this.headers,
            body: this.body,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(400);
        });
    });
});