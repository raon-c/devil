import { Card } from '../types/game';

/**
 * Creates a standard 40-card deck for the game.
 * Each deck consists of 4 sets (suits) of cards numbered 1 through 10.
 * For simplicity, suits can be named 'S1', 'S2', 'S3', 'S4'.
 * @returns {Card[]} An array of Card objects representing the deck.
 */
export function createDeck(): Card[] {
  const suits = ['S1', 'S2', 'S3', 'S4'];
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const number of numbers) {
      deck.push({ suit, number });
    }
  }
  return deck;
}

/**
 * Shuffles an array of cards in place using the Fisher-Yates algorithm.
 * @param {Card[]} deck - The array of cards to shuffle.
 * @returns {Card[]} The shuffled array of cards.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffledDeck = [...deck]; // Create a copy to avoid modifying the original array directly
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
}

/**
 * Deals a specified number of cards from the top of the deck.
 * @param {Card[]} deck - The deck to deal cards from.
 * @param {number} count - The number of cards to deal.
 * @returns {{ dealtCards: Card[], remainingDeck: Card[] }} An object containing the dealt cards and the remaining deck.
 * @throws {Error} if the deck does not have enough cards.
 */
export function dealCardsFromDeck(deck: Card[], count: number): { dealtCards: Card[]; remainingDeck: Card[] } {
  if (deck.length < count) {
    throw new Error('Not enough cards in the deck to deal.');
  }
  
  const dealtCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  
  return { dealtCards, remainingDeck };
}

// Example Usage (can be removed or kept for testing):
/*
const newDeck = createDeck();
console.log('New Deck:', newDeck.length, 'cards');
const shuffled = shuffleDeck(newDeck);
console.log('Shuffled Deck (first 5):', shuffled.slice(0, 5));

const { dealtCards, remainingDeck } = dealCardsFromDeck(shuffled, 5);
console.log('Dealt Cards:', dealtCards);
console.log('Remaining Deck (first 5):', remainingDeck.slice(0, 5));
console.log('Remaining Deck size:', remainingDeck.length);

try {
  dealCardsFromDeck(remainingDeck, 40); // This will throw an error
} catch (e) {
  if (e instanceof Error) {
    console.error('Error during dealing:', e.message);
  }
}
*/ 