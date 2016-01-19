var nfeDisponibilidade = require('./index.js');

module.exports = {
    'Verifica que exporta uma função': function(test) {
        test.equal(typeof nfeDisponibilidade, 'function');
        test.done();
    },

    'Lança exceção se chamar função sem callback': function(test) {
        // Para evitar desperdicio de internet
        test.throws(function() {
            nfeDisponibilidade();
        });

        test.done();
    }
};