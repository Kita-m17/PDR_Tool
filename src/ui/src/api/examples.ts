export interface Example{
    label: string;
    description: string;
    formulas: string[];
    query:string;
    algorithm: string;
}

export const EXAMPLES: Example[] = [
    {
        label: 'Penguin',
        description: 'Classic pengiun example: birds typically fly, but penguind do not',
        formulas: ['(bird|~flies)','(penguin=>bird)','(penguin|~!flies)'],
        query: 'penguin|~!flies',
        algorithm:'rational'
    },
    {
        label: 'Penguin Extended',
        description: 'Extended penguin example with multiple ranks',
        formulas: ['(animal|~moves)','(bird=>animal)','(bird|~flies)','(bird|~hasWings)','(penguin=>bird)','(penguin|~!flies)','(penguin|~swims)','(rockhopper=>penguin)','(rockhopper|~hasYellowFeathers)','(rockhopper|~!swims)'],
        query: 'rockhopper|~!swims',
        algorithm:'rational'
    },
    {
        label: 'Garfield',
        description: 'Garfield the cat: lazy and hates Mondays',
        formulas: ['(cat|~active)','(cat|~likesMondays)','(garfield=>cat)','(garfield|~!active)','(garfield|~hatesMondays)'],
        query: 'garfield|~!active',
        algorithm: 'rational'
    },
    {
        label: 'Kittens (Chipo Hamayobe)',
        description: 'Weak justification example: are kittens typically wild, given cats and animals typically are not?',
        formulas: ['(pets=>animals)','(kittens=>cats)','(cats|~trainable)','(kittens|~!trainable)','(animals|~legs)','(animals|~wild)','(cats=>animals)','(cats|~!wild)'],
        query: 'kittens|~!wild',
        algorithm: 'minimal relevant'
    }
]