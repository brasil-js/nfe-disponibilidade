var request = require('request'),
    cheerio = require('cheerio'),

    url = 'http://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx';

function obterStatus(imagem) {
    return {
        'imagens/bola_verde_P.png': 'disponivel',
        'imagens/bola_verde_G.png': 'disponivel',
        'imagens/bola_amarela_G.png': 'alerta',
        'imagens/bola_vermelho_G.png': 'indisponivel'
    }[imagem] || null;
}

function fazerParse(html) {
    var $ = cheerio.load(html),
        trSelector = 'table.tabelaListagemDados tr.linhaImparCentralizada, tr.linhaParCentralizada',
        resultado = {};

    $(trSelector).each(function(i, tr) {
        var $tr = $(tr),
            autorizador = $tr.find('td:first-child').html();

        autorizador = autorizador.toLowerCase();
        resultado[autorizador] = {};

        $(tr).find('td > img').each(function(j, img) {
            var coluna = [
                    'autorizacao',
                    'retornoAutorizacao',
                    'inutilizacao',
                    'consultaProtocolo',
                    'statusServico',
                    'consultaCadastro',
                    'recepcaoEvento'
                ][j],
                imagem = $(img).attr('src');

            resultado[autorizador][coluna] = obterStatus(imagem);
        });
    });

    return resultado;
}

function consultarDisponibilidade(callback) {
    if(!callback) {
        throw new Error('É necessário informar um callback');
    }

    request.get(url, {
        timeout: 5000
    }, function(err, res, html) {
        if(err) {
            return callback(err);
        }

        if(res.statusCode !== 200) {
            var erro = 'Impossível consultar a disponibilidade neste momento';
            return callback(erro);
        }

        callback(null, fazerParse(html));
    });
}

module.exports = consultarDisponibilidade;
