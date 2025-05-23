import { Card, ActualHandResult, HandRank } from '../types/game';
import { HAND_RANKS_ORDER } from './rules';

// Type for the return of individual findXYZ functions before private_cards_for_tiebreak is added
interface PotentialHandDetails {
  rank_determining_cards: number[];
  kickers: number[];
}

// --- Helper function to get all k-combinations from an array ---
function getCombinations<T>(array: T[], k: number): T[][] {
  const result: T[][] = [];
  function backtrack(startIndex: number, currentCombination: T[]) {
    if (currentCombination.length === k) {
      result.push([...currentCombination]);
      return;
    }
    if (startIndex === array.length) {
      return;
    }
    // Include array[startIndex]
    currentCombination.push(array[startIndex]);
    backtrack(startIndex + 1, currentCombination);
    currentCombination.pop(); // Backtrack

    // Exclude array[startIndex] - only if there are enough remaining elements to form a k-combination
    if (array.length - (startIndex + 1) >= k - currentCombination.length) {
      backtrack(startIndex + 1, currentCombination);
    }
  }
  backtrack(0, []);
  return result;
}

// --- Internal Hand Evaluation Functions (to be implemented) ---
// These functions will take 5 cards and return a partial ActualHandResult if the hand is found, otherwise null.

// interface PotentialHandResult {
//   hand_rank: HandRank;
//   rank_determining_cards: number[];
//   kickers: number[];
// }

function findFourOfAKind(fiveCards: Card[]): PotentialHandDetails | null {
  const counts: { [key: number]: number } = {};
  fiveCards.forEach(card => {
    counts[card.number] = (counts[card.number] || 0) + 1;
  });

  let fourCardNumber = -1;
  let kickerNumber = -1;

  for (const numStr in counts) {
    const num = parseInt(numStr);
    if (counts[num] === 4) {
      fourCardNumber = num;
    } else {
      kickerNumber = num; // Should be only one other card
    }
  }

  if (fourCardNumber !== -1) {
    return {
      rank_determining_cards: [fourCardNumber, fourCardNumber, fourCardNumber, fourCardNumber],
      kickers: [kickerNumber].filter(k => k !== -1) // Ensure kicker is valid
    };
  }
  return null;
}

function findFullHouse(fiveCards: Card[]): PotentialHandDetails | null {
  const counts: { [key: number]: number } = {};
  fiveCards.forEach(card => {
    counts[card.number] = (counts[card.number] || 0) + 1;
  });

  let threeCardNumber = -1;
  let pairCardNumber = -1;

  for (const numStr in counts) {
    const num = parseInt(numStr);
    if (counts[num] === 3) {
      threeCardNumber = num;
    } else if (counts[num] === 2) {
      pairCardNumber = num;
    }
  }

  if (threeCardNumber !== -1 && pairCardNumber !== -1) {
    return {
      rank_determining_cards: [threeCardNumber, threeCardNumber, threeCardNumber, pairCardNumber, pairCardNumber],
      kickers: [] // Full house has no kickers
    };
  }
  return null;
}

function findStraight(fiveCards: Card[]): PotentialHandDetails | null {
  const sortedNumbers = Array.from(new Set(fiveCards.map(card => card.number))).sort((a, b) => b - a);

  if (sortedNumbers.length < 5) {
    return null; // Not enough unique cards to form a 5-card straight
  }

  // Check for 10-high straight (10-9-8-7-6) down to 5-high straight (5-4-3-2-1)
  for (let i = 0; i <= sortedNumbers.length - 5; i++) {
    const potentialStraight = sortedNumbers.slice(i, i + 5);
    let isStraight = true;
    for (let j = 0; j < potentialStraight.length - 1; j++) {
      if (potentialStraight[j] !== potentialStraight[j+1] + 1) {
        isStraight = false;
        break;
      }
    }
    if (isStraight) {
      return {
        rank_determining_cards: [potentialStraight[0]], // Highest card of the straight
        kickers: [] // Straights don't have kickers in this context
      };
    }
  }
  
  // Special case for A-5 straight (1-2-3-4-5, with 1 representing Ace)
  // In this game, cards are 1-10. So we check for 5-4-3-2-1 (1 is the lowest Ace)
  const aceLowStraightNumbers = [5,4,3,2,1];
  if (aceLowStraightNumbers.every(num => sortedNumbers.includes(num))) {
      return {
          rank_determining_cards: [5], // Highest card is 5 for A-5 straight
          kickers: []
      };
  }

  return null;
}

function findThreeOfAKind(fiveCards: Card[]): PotentialHandDetails | null {
  const counts: { [key: number]: number } = {};
  fiveCards.forEach(card => {
    counts[card.number] = (counts[card.number] || 0) + 1;
  });

  let threeCardNumber = -1;
  const kickers: number[] = [];

  for (const numStr in counts) {
    const num = parseInt(numStr);
    if (counts[num] === 3) {
      threeCardNumber = num;
    } else {
      // Add card number `counts[num]` times to kickers
      for (let i = 0; i < counts[num]; i++) {
        kickers.push(num);
      }
    }
  }

  if (threeCardNumber !== -1) {
    kickers.sort((a, b) => b - a); // Sort kickers high to low
    return {
      rank_determining_cards: [threeCardNumber, threeCardNumber, threeCardNumber],
      kickers: kickers.slice(0, 2) // Max 2 kickers
    };
  }
  return null;
}

function findTwoPair(fiveCards: Card[]): PotentialHandDetails | null {
  const counts: { [key: number]: number } = {};
  fiveCards.forEach(card => {
    counts[card.number] = (counts[card.number] || 0) + 1;
  });

  const pairs: number[] = [];
  const kickers: number[] = [];

  for (const numStr in counts) {
    const num = parseInt(numStr);
    if (counts[num] === 2) {
      pairs.push(num);
    } else {
      // Add card number `counts[num]` times to kickers (should be once if it's a kicker for two pair)
       for (let i = 0; i < counts[num]; i++) {
        kickers.push(num);
      }
    }
  }

  if (pairs.length === 2) {
    pairs.sort((a, b) => b - a); // Sort pairs high to low
    kickers.sort((a,b) => b-a); // Sort kicker (should be one, but sort anyway)
    return {
      rank_determining_cards: [pairs[0], pairs[0], pairs[1], pairs[1]],
      kickers: kickers.slice(0, 1) // Max 1 kicker
    };
  }
  return null;
}

function findOnePair(fiveCards: Card[]): PotentialHandDetails | null {
  const counts: { [key: number]: number } = {};
  fiveCards.forEach(card => {
    counts[card.number] = (counts[card.number] || 0) + 1;
  });

  let pairNumber = -1;
  const kickers: number[] = [];

  for (const numStr in counts) {
    const num = parseInt(numStr);
    if (counts[num] === 2) {
      pairNumber = num;
    } else {
      // Add card number `counts[num]` times to kickers
      for (let i = 0; i < counts[num]; i++) {
        kickers.push(num);
      }
    }
  }

  if (pairNumber !== -1) {
    kickers.sort((a, b) => b - a); // Sort kickers high to low
    return {
      rank_determining_cards: [pairNumber, pairNumber],
      kickers: kickers.slice(0, 3) // Max 3 kickers
    };
  }
  return null;
}

function findHighCard(fiveCards: Card[]): PotentialHandDetails {
  const sortedNumbers = fiveCards.map(c => c.number).sort((a, b) => b - a);
  return { rank_determining_cards: [], kickers: sortedNumbers.slice(0, 5) }; // Ensure 5 kickers for high card
}

/**
 * Compares two hand evaluations and returns the better one.
 * Does not consider private_cards_for_tiebreak here, that's for final winner determination if hands are equal.
 */
function compareEvaluations(eval1: ActualHandResult, eval2: ActualHandResult): ActualHandResult {
  const rank1Index = HAND_RANKS_ORDER.indexOf(eval1.hand_rank);
  const rank2Index = HAND_RANKS_ORDER.indexOf(eval2.hand_rank);

  if (rank1Index < rank2Index) return eval1; // Lower index means better rank
  if (rank1Index > rank2Index) return eval2;

  // Ranks are the same, compare rank_determining_cards
  for (let i = 0; i < Math.max(eval1.rank_determining_cards.length, eval2.rank_determining_cards.length); i++) {
    const card1 = eval1.rank_determining_cards[i] || 0;
    const card2 = eval2.rank_determining_cards[i] || 0;
    if (card1 > card2) return eval1;
    if (card1 < card2) return eval2;
  }

  // rank_determining_cards are the same, compare kickers
  for (let i = 0; i < Math.max(eval1.kickers.length, eval2.kickers.length); i++) {
    const kicker1 = eval1.kickers[i] || 0;
    const kicker2 = eval2.kickers[i] || 0;
    if (kicker1 > kicker2) return eval1;
    if (kicker1 < kicker2) return eval2;
  }
  
  return eval1; // Hands are identical based on rank, determining cards, and kickers
}

/**
 * Evaluates a given set of 6 cards (2 private + 4 shared) to find the best possible 5-card poker hand.
 * @param {Card[]} sixCards - An array of exactly 6 Card objects.
 * @param {Card[]} privatePlayerCards - An array of exactly 2 private Card objects of the player whose hand is being evaluated.
 *                                      Needed for tie-breaking rules.
 * @returns {ActualHandResult | null} The best hand evaluation, or null if input is invalid.
 */
export function evaluateHand(sixCards: Card[], privatePlayerCards: Card[]): ActualHandResult | null {
  if (sixCards.length !== 6) {
    console.error("evaluateHand expects 6 cards.");
    return null;
  }
  if (privatePlayerCards.length !== 2) {
    console.error("evaluateHand expects 2 private player cards for tie-breaking.");
    return null;
  }

  const fiveCardCombinations = getCombinations(sixCards, 5);
  let bestHandEvaluation: ActualHandResult | null = null;

  const sortedPrivateCardNumbers = privatePlayerCards.map(c => c.number).sort((a,b) => b-a) as [number, number];

  for (const fiveCardCombo of fiveCardCombinations) {
    let bestRankForCurrentCombo: ActualHandResult | null = null;

    for (const rank of HAND_RANKS_ORDER) {
      let currentRankDetails: PotentialHandDetails | null = null;

      // TODO: Call the specific findXYZ functions here
      // Example structure:
      // if (rank === "four-of-a-kind") { currentRankDetails = findFourOfAKind(fiveCardCombo); }
      if (rank === "four-of-a-kind") {
        currentRankDetails = findFourOfAKind(fiveCardCombo);
      } else if (rank === "full-house") {
        currentRankDetails = findFullHouse(fiveCardCombo);
      } else if (rank === "straight") {
        currentRankDetails = findStraight(fiveCardCombo);
      } else if (rank === "three-of-a-kind") {
        currentRankDetails = findThreeOfAKind(fiveCardCombo);
      } else if (rank === "two-pair") {
        currentRankDetails = findTwoPair(fiveCardCombo);
      } else if (rank === "one-pair") {
        currentRankDetails = findOnePair(fiveCardCombo);
      } else if (rank === "high-card") { // High card always provides a result for 5 cards
        currentRankDetails = findHighCard(fiveCardCombo);
      }

      if (currentRankDetails) {
        const evaluation: ActualHandResult = {
          ...currentRankDetails, // Spread operator should be safe if currentRankDetails is not null
          hand_rank: rank,
          private_cards_for_tiebreak: sortedPrivateCardNumbers,
        };
        
        // The first rank found (due to HAND_RANKS_ORDER) is the best for this 5-card combo
        bestRankForCurrentCombo = evaluation;
        break; // Found the best rank for this fiveCardCombo
      }
    }

    if (bestRankForCurrentCombo) {
      if (!bestHandEvaluation) {
        bestHandEvaluation = bestRankForCurrentCombo;
      } else {
        bestHandEvaluation = compareEvaluations(bestHandEvaluation, bestRankForCurrentCombo);
      }
    }
  }

  // If no hand was found (should not happen if high-card is implemented properly for 5 cards)
  if (!bestHandEvaluation) {
     // Fallback to high card of the two private cards if all else fails or as a placeholder.
     // This specific fallback might not be standard poker but covers edge cases in logic development.
     // A proper high card evaluation of a 5-card hand should always yield a result.
     console.warn("No hand evaluation found, this indicates an issue in findXYZ functions or comparison logic.");
     // As a very basic fallback, can use private cards to form some notion of high card, though this isn't a 5-card hand.
     // For a robust system, findHighCard on a 5-card combo should always return a valid result.
     const sortedKickers = privatePlayerCards.map(c => c.number).sort((a, b) => b - a);
     bestHandEvaluation = {
        hand_rank: "high-card",
        rank_determining_cards: [],
        kickers: sortedKickers, // This would only be 2 kickers, not 5 as typical for high card
        private_cards_for_tiebreak: sortedPrivateCardNumbers,
     };
  }
  
  return bestHandEvaluation;
}

// TODO:
// 1. Implement all `find<RankName>(fiveCards: Card[])` helper functions.
//    - These should correctly identify the hand and populate `rank_determining_cards` and `kickers`.
//    - Cards in `rank_determining_cards` and `kickers` should be sorted (usually high to low).
// 2. Integrate `compareEvaluations` into the main loop of `evaluateHand`.
// 3. Add thorough unit tests for all helper functions and `evaluateHand` with various card combinations. 