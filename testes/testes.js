var nock = require('nock'),

    fs = require('fs'),
    path = require('path'),

    url = 'http://www.nfe.fazenda.gov.br/portal',
    mensagemDeErro = 'Impossível consultar a disponibilidade neste momento',
    nfeDisponibilidade = require('../index.js');

function executarCasoDeTeste(nomeDoTeste) {
    return function(test) {
        var caminhoDaResposta = path.join(__dirname, nomeDoTeste, 'resultado.html'),
            resposta = fs.readFileSync(caminhoDaResposta).toString(),

            caminhoDaExpectativa = path.join(__dirname, nomeDoTeste, 'expectativa.json'),
            expectativa = require(caminhoDaExpectativa);

        nock(url).get('/disponibilidade.aspx').reply(200, resposta);

        nfeDisponibilidade(function(err, disponibilidade) {
            test.ifError(err);
            test.deepEqual(disponibilidade, expectativa);
            test.done();
        });
    }
}

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
    },

    'Retorna erro quando o status é 500': function(test) {
        nock(url).get('/disponibilidade.aspx').reply(500);

        nfeDisponibilidade(function(err) {
            test.equal(err.message, mensagemDeErro);
            test.done();
        });
    },

    'Retorna erro quando o status é 404': function(test) {
        nock(url).get('/disponibilidade.aspx').reply(404);

        nfeDisponibilidade(function(err) {
            test.equal(err.message, mensagemDeErro);
            test.done();
        });
    },

    'Faz o parse adequadamente todos autorizados estao ok': executarCasoDeTeste('tudoOk'),
    'Faz o parse adequadamente quando go esta totalmente fora do ar': executarCasoDeTeste('goTotalmenteForaDoAr'),
};