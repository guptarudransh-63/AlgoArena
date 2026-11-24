const testCases = {
  'two-sum': [
    { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isPublic: true, order: 1 },
    { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isPublic: true, order: 2 },
    { input: '[3,3]\n6', expectedOutput: '[0,1]', isPublic: true, order: 3 },
    { input: '[1,5,8,3,9]\n11', expectedOutput: '[1,2]', isPublic: false, order: 4 },
    { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isPublic: false, order: 5 },
    { input: '[1000000000, -1000000000]\n0', expectedOutput: '[0,1]', isPublic: false, order: 6 },
    { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]', isPublic: false, order: 7 }
  ],
  'valid-parentheses': [
    { input: '()', expectedOutput: 'true', isPublic: true, order: 1 },
    { input: '()[]{}', expectedOutput: 'true', isPublic: true, order: 2 },
    { input: '(]', expectedOutput: 'false', isPublic: true, order: 3 },
    { input: '([)]', expectedOutput: 'false', isPublic: false, order: 4 },
    { input: '{[]}', expectedOutput: 'true', isPublic: false, order: 5 },
    { input: '(((((((((())))))))))', expectedOutput: 'true', isPublic: false, order: 6 },
    { input: ']', expectedOutput: 'false', isPublic: false, order: 7 },
    { input: '[', expectedOutput: 'false', isPublic: false, order: 8 }
  ],
  'best-time-to-buy-and-sell-stock': [
    { input: '[7,1,5,3,6,4]', expectedOutput: '5', isPublic: true, order: 1 },
    { input: '[7,6,4,3,1]', expectedOutput: '0', isPublic: true, order: 2 },
    { input: '[1,2]', expectedOutput: '1', isPublic: false, order: 3 },
    { input: '[2,4,1]', expectedOutput: '2', isPublic: false, order: 4 },
    { input: '[3,2,6,5,0,3]', expectedOutput: '4', isPublic: false, order: 5 },
    { input: '[1,2,3,4,5]', expectedOutput: '4', isPublic: false, order: 6 }
  ],
  'valid-palindrome': [
    { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true', isPublic: true, order: 1 },
    { input: 'race a car', expectedOutput: 'false', isPublic: true, order: 2 },
    { input: ' ', expectedOutput: 'true', isPublic: true, order: 3 },
    { input: '0P', expectedOutput: 'false', isPublic: false, order: 4 },
    { input: 'ab_a', expectedOutput: 'true', isPublic: false, order: 5 },
    { input: '.,', expectedOutput: 'true', isPublic: false, order: 6 },
    { input: 'Was it a car or a cat I saw?', expectedOutput: 'true', isPublic: false, order: 7 }
  ],
  'maximum-subarray': [
    { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isPublic: true, order: 1 },
    { input: '[1]', expectedOutput: '1', isPublic: true, order: 2 },
    { input: '[5,4,-1,7,8]', expectedOutput: '23', isPublic: true, order: 3 },
    { input: '[-1]', expectedOutput: '-1', isPublic: false, order: 4 },
    { input: '[-2,-1]', expectedOutput: '-1', isPublic: false, order: 5 },
    { input: '[1,2,3,-2,5]', expectedOutput: '9', isPublic: false, order: 6 },
    { input: '[-3,-2,0,-1]', expectedOutput: '0', isPublic: false, order: 7 }
  ],
  'binary-search': [
    { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isPublic: true, order: 1 },
    { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isPublic: true, order: 2 },
    { input: '[5]\n5', expectedOutput: '0', isPublic: false, order: 3 },
    { input: '[5]\n-5', expectedOutput: '-1', isPublic: false, order: 4 },
    { input: '[1,3,5,7,9,11,13]\n1', expectedOutput: '0', isPublic: false, order: 5 },
    { input: '[1,3,5,7,9,11,13]\n13', expectedOutput: '6', isPublic: false, order: 6 }
  ],
  'longest-substring-without-repeating-characters': [
    { input: 'abcabcbb', expectedOutput: '3', isPublic: true, order: 1 },
    { input: 'bbbbb', expectedOutput: '1', isPublic: true, order: 2 },
    { input: 'pwwkew', expectedOutput: '3', isPublic: true, order: 3 },
    { input: '', expectedOutput: '0', isPublic: false, order: 4 },
    { input: 'au', expectedOutput: '2', isPublic: false, order: 5 },
    { input: 'dvdf', expectedOutput: '3', isPublic: false, order: 6 },
    { input: 'tmmzuxt', expectedOutput: '5', isPublic: false, order: 7 }
  ],
  'climbing-stairs': [
    { input: '2', expectedOutput: '2', isPublic: true, order: 1 },
    { input: '3', expectedOutput: '3', isPublic: true, order: 2 },
    { input: '1', expectedOutput: '1', isPublic: false, order: 3 },
    { input: '4', expectedOutput: '5', isPublic: false, order: 4 },
    { input: '5', expectedOutput: '8', isPublic: false, order: 5 },
    { input: '10', expectedOutput: '89', isPublic: false, order: 6 },
    { input: '20', expectedOutput: '10946', isPublic: false, order: 7 }
  ],
  'coin-change': [
    { input: '[1,2,5]\n11', expectedOutput: '3', isPublic: true, order: 1 },
    { input: '[2]\n3', expectedOutput: '-1', isPublic: true, order: 2 },
    { input: '[1]\n0', expectedOutput: '0', isPublic: true, order: 3 },
    { input: '[186,419,83,408]\n6249', expectedOutput: '20', isPublic: false, order: 4 },
    { input: '[2,5,10,1]\n27', expectedOutput: '4', isPublic: false, order: 5 },
    { input: '[2]\n1', expectedOutput: '-1', isPublic: false, order: 6 }
  ],
  'container-with-most-water': [
    { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isPublic: true, order: 1 },
    { input: '[1,1]', expectedOutput: '1', isPublic: true, order: 2 },
    { input: '[4,3,2,1,4]', expectedOutput: '16', isPublic: false, order: 3 },
    { input: '[1,2,1]', expectedOutput: '2', isPublic: false, order: 4 },
    { input: '[2,3,4,5,18,17,6]', expectedOutput: '17', isPublic: false, order: 5 },
    { input: '[1,2,4,3]', expectedOutput: '4', isPublic: false, order: 6 }
  ],
  'trapping-rain-water': [
    { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isPublic: true, order: 1 },
    { input: '[4,2,0,3,2,5]', expectedOutput: '9', isPublic: true, order: 2 },
    { input: '[3,0,2,0,4]', expectedOutput: '7', isPublic: false, order: 3 },
    { input: '[1,1,1,1]', expectedOutput: '0', isPublic: false, order: 4 },
    { input: '[2,0,2]', expectedOutput: '2', isPublic: false, order: 5 }
  ],
  'reverse-linked-list': [
    { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isPublic: true, order: 1 },
    { input: '[1,2]', expectedOutput: '[2,1]', isPublic: true, order: 2 },
    { input: '[]', expectedOutput: '[]', isPublic: true, order: 3 },
    { input: '[1]', expectedOutput: '[1]', isPublic: false, order: 4 },
    { input: '[1,2,3]', expectedOutput: '[3,2,1]', isPublic: false, order: 5 }
  ],
  'invert-binary-tree': [
    { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isPublic: true, order: 1 },
    { input: '[2,1,3]', expectedOutput: '[2,3,1]', isPublic: true, order: 2 },
    { input: '[]', expectedOutput: '[]', isPublic: true, order: 3 }
  ],
  'course-schedule': [
    { input: '2\n[[1,0]]', expectedOutput: 'true', isPublic: true, order: 1 },
    { input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', isPublic: true, order: 2 },
    { input: '3\n[[1,0],[2,1]]', expectedOutput: 'true', isPublic: false, order: 3 },
    { input: '4\n[[1,0],[2,0],[3,1],[3,2]]', expectedOutput: 'true', isPublic: false, order: 4 }
  ]
};

module.exports = testCases;
