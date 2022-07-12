const natural = require('natural');
const stopword = require('stopword');
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const prioritize = async (text) => {
  const lexedText = await aposToLexForm(text);
  const casedText = lexedText.toLowerCase();

  const alphaOnlyText = casedText.replace(/[^a-zA-Z\s]+/g, '');

  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedText = tokenizer.tokenize(alphaOnlyText);

  tokenizedText.forEach((word, index) => {
    tokenizedText[index] = spellCorrector.correct(word);
  });

  const filteredText = stopword.removeStopwords(tokenizedText);

  const { SentimentAnalyzer, PorterStemmer } = natural;
  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
  const analysis = analyzer.getSentiment(filteredText);

  return analysis > 0 ? 'Low' : analysis < 0 ? 'High' : 'Medium';
};

module.exports = { prioritize };
