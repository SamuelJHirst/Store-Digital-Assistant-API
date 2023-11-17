describe('Delete Products', function() {
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
    
    it('Delete Product Without Authentication', function() {
        cy.request({
            method: 'DELETE',
            url: '/products/' + this.body.ean,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(401);
        });
    });

    it('Delete Valid Product', function() {
        cy.request({
            method: 'DELETE',
            url: '/products/' + this.body.ean,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(204);
        });
    });

    it('Delete Invalid Product', function() {
        cy.request({
            method: 'DELETE',
            url: '/products/' + this.body.ean,
            headers: this.headers,
            failOnStatusCode: false
        }).should(function(response) {
            expect(response.status).to.eq(404);
        });
    })
});