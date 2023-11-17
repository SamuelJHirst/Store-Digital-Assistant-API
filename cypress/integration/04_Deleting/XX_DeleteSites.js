describe('Delete Sites', function() {
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
    
    it('Delete Site Without Authentication', function() {
        cy.request({
            method: 'DELETE',
            url: '/locations/' + this.body.code,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Delete Valid Site', function() {
        cy.request({
            method: 'DELETE',
            url: '/locations/' + this.body.code,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(204);
        });
    });

    it('Delete Another Valid Site', function() {
        cy.fixture('sites/newSite2').as('newSite2').then(function(data) {
            cy.request({
                method: 'DELETE',
                url: '/locations/' + data.code,
                headers: this.headers,
                failOnStatusCode: false
            }).should(function(response) {
                expect(response.status).to.eq(204);
            });
        });
    });

    it('Delete Invalid Site', function() {
        cy.request({
            method: 'DELETE',
            url: '/locations/' + this.body.code,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    })
});