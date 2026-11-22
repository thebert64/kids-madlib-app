// Mad Libs story templates. Server-only: the story text stays hidden until
// every blank is filled. Blanks are written as {kind}; see WORD_HINTS for kinds.

export interface MadLibTemplate {
  id: string;
  title: string;
  blurb: string;
  text: string;
}

export const MADLIB_TEMPLATES: MadLibTemplate[] = [
  {
    id: 'zoo-day',
    title: 'A Wild Day at the Zoo',
    blurb: 'Something strange is happening in the animal kingdom...',
    text:
      'Last Tuesday my class took a field trip to the zoo. The first animal we saw was a {adjective} {animal} ' +
      'that was {verb ending in ing} on top of a giant {noun}. The zookeeper, {name}, told us it eats ' +
      '{number} bowls of {food} every morning! Then a {color} {animal} escaped and ran straight to ' +
      '{place}. Everyone yelled "{exclamation}!" and we all {past tense verb} home with {plural noun} in our ' +
      'pockets. Best. Trip. Ever.',
  },
  {
    id: 'space-mission',
    title: 'Mission to Planet Zog',
    blurb: 'Blast off on a very important space adventure.',
    text:
      'Captain {name} climbed into the {adjective} rocket ship and pressed the big {color} button. ' +
      '"{exclamation}!" shouted the crew as we zoomed past {number} stars. When we landed on Planet Zog, ' +
      'the aliens had {number} {plural noun} instead of a {body part}. Their leader, a giant {animal}, ' +
      'offered us a plate of {food} and said "{silly word}," which means "please {verb} with us." ' +
      'We danced {adverb} until it was time to fly back to {place}.',
  },
  {
    id: 'pizza-chef',
    title: 'The World’s Weirdest Pizza',
    blurb: 'You are the chef. What could possibly go wrong?',
    text:
      'Welcome to {name}’s Pizza Palace! Today we are making a {adjective} pizza. First, toss the dough ' +
      'up to {place}. Next, spread on some {color} sauce and sprinkle it with {plural noun}. ' +
      'For the secret ingredient, add one {animal} {body part}. Bake it for {number} minutes while ' +
      '{verb ending in ing} {adverb}. When the oven goes "{silly word}!" your pizza is ready. ' +
      'It tastes just like {food}!',
  },
  {
    id: 'superhero',
    title: 'The Amazing Superhero',
    blurb: 'A brand-new superhero is born today.',
    text:
      'One {adjective} morning, {name} woke up with the power to {verb} faster than a {animal}. ' +
      'With a cape made of {plural noun} and a {color} mask, our hero raced to {place} to stop the evil ' +
      'Dr. {silly word}, who was stealing all the {food} in town. "{exclamation}!" cried the villain as ' +
      'our hero {past tense verb} right over a {noun}. The town threw a party with {number} cakes, and ' +
      'everyone cheered until their {body part} hurt.',
  },
];

export function getTemplate(id: string | null | undefined): MadLibTemplate | undefined {
  return MADLIB_TEMPLATES.find((t) => t.id === id);
}
