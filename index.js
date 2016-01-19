var request = require('request'),
    cheerio = require('cheerio'),
    moment = require('moment'),

    url = 'http://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx',
    regexDeUltimaVerificacao = /.ltima Verifica..o:\s([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})/,
    DISPONIVEL = 'disponivel',
    ALERTA = 'alerta',
    INDISPONIVEL = 'indisponivel';

function obterColuna(indice) {
    return [
        'autorizacao',
        'retornoAutorizacao',
        'inutilizacao',
        'consultaProtocolo',
        'statusServico',
        'consultaCadastro',
        'recepcaoEvento'
    ][indice];
}

function obterStatus(imagem) {
    return {
        'imagens/bola_verde_P.png': DISPONIVEL,
        'imagens/bola_verde_G.png': DISPONIVEL,
        'imagens/bola_amarela_P.png': ALERTA,
        'imagens/bola_amarela_G.png': ALERTA,
        'imagens/bola_vermelho_P.png': INDISPONIVEL,
        'imagens/bola_vermelho_G.png': INDISPONIVEL
    }[imagem] || null;
}

function extrairUltimaVerificacao(html) {
    var match = html.match(regexDeUltimaVerificacao),
        ultimaVerificacao;

    if(match) {
        ultimaVerificacao = new moment(match[1], 'D/M/YYYY HH:mm:ss');
        ultimaVerificacao = ultimaVerificacao.toDate();
        return ultimaVerificacao.toISOString();
    }

    return null;
}

function fazerParse(html) {
    var $ = cheerio.load(html),
        trSelector = 'table.tabelaListagemDados tr.linhaImparCentralizada, tr.linhaParCentralizada',
        resultado = {
            ultimaVerificacao: extrairUltimaVerificacao(html)
        };

    $(trSelector).each(function(i, tr) {
        var $tr = $(tr),
            autorizador = $tr.find('td:first-child').html();

        autorizador = autorizador.toLowerCase();
        resultado[autorizador] = {};

        $(tr).find('td > img').each(function(j, img) {
            var coluna = obterColuna(j),
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

        // console.log(html);

        if(res.statusCode !== 200) {
            var erro = new Error('Impossível consultar a disponibilidade neste momento');
            return callback(erro);
        }

        callback(null, fazerParse(html));
    });
}

module.exports = consultarDisponibilidade;
