/**
 * Esse arquivo lista todas as engines disponíveis para uso.
 * 
 * @author Fernando Bevilacqua <fernando.bevilacqua@uffs.edu.br>
 */

const availableEngines = {
    // Possui conhecimento sobre algo em específico (domain)
    domain: require('./domain'),

    // Fluxo para perguntas e respostas.
    qna: require('./qna'),
};

module.exports = {
    availableEngines,
}