const natural = require('natural');
const stopword = require('stopword');
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const prioritize = (text) => {
  const lexedReview = aposToLexForm(text);
  const casedReview = lexedReview.toLowerCase();

  const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

  // tokenize review
  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);

  // spell correction
  tokenizedReview.forEach((word, index) => {
    tokenizedReview[index] = spellCorrector.correct(word);
  });

  // remove stopwords
  const filteredReview = stopword.removeStopwords(tokenizedReview);

  const { SentimentAnalyzer, PorterStemmer } = natural;
  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');

  const analysis = analyzer.getSentiment(filteredReview);

  if (analysis.score > 0) {
    return 'High';
  } else if (analysis.score < 0) {
    return 'Low';
  } else {
    return 'Medium';
  }
};

module.exports = { prioritize };
