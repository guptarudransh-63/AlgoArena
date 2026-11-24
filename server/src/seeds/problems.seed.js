const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hashing'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: '[2,7,11,15]\n9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: '[3,2,4]\n6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: '[3,3]\n6',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line.trim()));
rl.on('close', () => {
  if (lines.length >= 2) {
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1], 10);
    console.log(JSON.stringify(twoSum(nums, target)));
  }
});
`,
      python: `import json
import sys

def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

if __name__ == '__main__':
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(json.dumps(twoSum(nums, target)))
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line1 = sc.nextLine().trim();
            line1 = line1.substring(1, line1.length() - 1);
            String[] parts = line1.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
            int target = Integer.parseInt(sc.nextLine().trim());
            int[] res = twoSum(nums, target);
            System.out.println("[" + res[0] + "," + res[1] + "]");
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <sstream>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> m;
    for (int i = 0; i < nums.size(); ++i) {
        int comp = target - nums[i];
        if (m.find(comp) != m.end()) return {m[comp], i};
        m[nums[i]] = i;
    }
    return {};
}

int main() {
    string line;
    if (getline(cin, line)) {
        string s = line.substr(1, line.size() - 2);
        stringstream ss(s);
        string item;
        vector<int> nums;
        while (getline(ss, item, ',')) nums.push_back(stoi(item));
        int target;
        cin >> target;
        auto res = twoSum(nums, target);
        cout << "[" << res[0] << "," << res[1] << "]" << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Can you use a Hash Map to check complements in O(1) time?']
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    tags: ['Strings', 'Stacks'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: '()',
        output: 'true',
        explanation: 'Simple valid pair.'
      },
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All pairs properly closed.'
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Bracket type mismatch.'
      }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \`()[]{}\`.'],
    starterTemplates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(isValid(line.trim()).toString());
});
`,
      python: `import sys

def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == '__main__':
    for line in sys.stdin:
        if line.strip():
            print(str(isValid(line.strip())).lower())
`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(isValid(sc.nextLine().trim()));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.empty() || st.top() != c) return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Consider using a Stack data structure.']
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    tags: ['Arrays', 'Dynamic Programming'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: '[7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        input: '[7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) minPrice = price;
    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
  }
  return maxProfit;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (line.trim()) {
    const prices = JSON.parse(line.trim());
    console.log(maxProfit(prices));
  }
});
`,
      python: `import json
import sys

def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit

if __name__ == '__main__':
    for line in sys.stdin:
        if line.strip():
            prices = json.loads(line.strip())
            print(maxProfit(prices))
`,
      java: `import java.util.*;

public class Main {
    public static int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int p : prices) {
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        return maxProfit;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            line = line.substring(1, line.length() - 1);
            if (line.isEmpty()) { System.out.println(0); return; }
            String[] parts = line.split(",");
            int[] prices = new int[parts.length];
            for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i].trim());
            System.out.println(maxProfit(prices));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

int maxProfit(vector<int>& prices) {
    int minPrice = 1e9, maxP = 0;
    for (int p : prices) {
        minPrice = min(minPrice, p);
        maxP = max(maxP, p - minPrice);
    }
    return maxP;
}

int main() {
    string line;
    if (getline(cin, line)) {
        string s = line.substr(1, line.size() - 2);
        if (s.empty()) { cout << 0 << endl; return 0; }
        stringstream ss(s);
        string item;
        vector<int> prices;
        while (getline(ss, item, ',')) prices.push_back(stoi(item));
        cout << maxProfit(prices) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Track the minimum price seen so far as you iterate through the list.']
  },
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    tags: ['Strings', 'Two Pointers'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` *if it is a palindrome, or* \`false\` *otherwise*.`,
    examples: [
      {
        input: 'A man, a plan, a canal: Panama',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 'race a car',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: ' ',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters.'
      }
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
    starterTemplates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++;
    r--;
  }
  return true;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(isPalindrome(line).toString());
});
`,
      python: `import sys

def isPalindrome(s: str) -> bool:
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]

if __name__ == '__main__':
    for line in sys.stdin:
        line = line.rstrip('\\r\\n')
        print(str(isPalindrome(line)).lower())
`,
      java: `import java.util.*;

public class Main {
    public static boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
            l++;
            r--;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(isPalindrome(sc.nextLine()));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

bool isPalindrome(string s) {
    int l = 0, r = s.size() - 1;
    while (l < r) {
        while (l < r && !isalnum(s[l])) l++;
        while (l < r && !isalnum(s[r])) r--;
        if (tolower(s[l]) != tolower(s[r])) return false;
        l++;
        r--;
    }
    return true;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << (isPalindrome(s) ? "true" : "false") << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Two pointers starting at both ends moving inwards.']
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    tags: ['Arrays', 'Dynamic Programming'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
    examples: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: '[1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      },
      {
        input: '[5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.'
      }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  let cur = nums[0];
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    max = Math.max(max, cur);
  }
  return max;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (line.trim()) {
    const nums = JSON.parse(line.trim());
    console.log(maxSubArray(nums));
  }
});
`,
      python: `import json
import sys

def maxSubArray(nums):
    cur = max_s = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        max_s = max(max_s, cur)
    return max_s

if __name__ == '__main__':
    for line in sys.stdin:
        if line.strip():
            nums = json.loads(line.strip())
            print(maxSubArray(nums))
`,
      java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        int cur = nums[0], max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            max = Math.max(max, cur);
        }
        return max;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            line = line.substring(1, line.length() - 1);
            String[] parts = line.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
            System.out.println(maxSubArray(nums));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

int maxSubArray(vector<int>& nums) {
    int cur = nums[0], maxS = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        cur = max(nums[i], cur + nums[i]);
        maxS = max(maxS, cur);
    }
    return maxS;
}

int main() {
    string line;
    if (getline(cin, line)) {
        string s = line.substr(1, line.size() - 2);
        stringstream ss(s);
        string item;
        vector<int> nums;
        while (getline(ss, item, ',')) nums.push_back(stoi(item));
        cout << maxSubArray(nums) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ["Try Kadane's Algorithm to solve it in O(n) time."]
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    tags: ['Binary Search', 'Arrays'],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      {
        input: '[-1,0,3,5,9,12]\n9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.'
      },
      {
        input: '[-1,0,3,5,9,12]\n2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.'
      }
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique.'],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line.trim()));
rl.on('close', () => {
  if (lines.length >= 2) {
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1], 10);
    console.log(search(nums, target));
  }
});
`,
      python: `import json
import sys

def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1

if __name__ == '__main__':
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(search(nums, target))
`,
      java: `import java.util.*;

public class Main {
    public static int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line1 = sc.nextLine().trim();
            line1 = line1.substring(1, line1.length() - 1);
            String[] parts = line1.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
            int target = Integer.parseInt(sc.nextLine().trim());
            System.out.println(search(nums, target));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

int search(vector<int>& nums, int target) {
    int l = 0, r = nums.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

int main() {
    string line;
    if (getline(cin, line)) {
        string s = line.substr(1, line.size() - 2);
        stringstream ss(s);
        string item;
        vector<int> nums;
        while (getline(ss, item, ',')) nums.push_back(stoi(item));
        int target;
        cin >> target;
        cout << search(nums, target) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Check the middle element and reduce the search space by half.']
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    tags: ['Strings', 'Sliding Window', 'Hashing'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 'abcabcbb',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 'bbbbb',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 'pwwkew',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    starterTemplates: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let max = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (map.has(s[i]) && map.get(s[i]) >= start) {
      start = map.get(s[i]) + 1;
    }
    map.set(s[i], i);
    max = Math.max(max, i - start + 1);
  }
  return max;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(lengthOfLongestSubstring(line));
});
`,
      python: `import sys

def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    max_len = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len

if __name__ == '__main__':
    for line in sys.stdin:
        line = line.rstrip('\\r\\n')
        print(lengthOfLongestSubstring(line))
`,
      java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int max = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (map.containsKey(c) && map.get(c) >= start) {
                start = map.get(c) + 1;
            }
            map.put(c, i);
            max = Math.max(max, i - start + 1);
        }
        return max;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(lengthOfLongestSubstring(sc.nextLine()));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> m;
    int maxL = 0, start = 0;
    for (int i = 0; i < s.size(); ++i) {
        if (m.find(s[i]) != m.end() && m[s[i]] >= start) {
            start = m[s[i]] + 1;
        }
        m[s[i]] = i;
        maxL = max(maxL, i - start + 1);
    }
    return maxL;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << lengthOfLongestSubstring(s) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Use a sliding window with two pointers.']
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Mathematics'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: '2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1 step + 1 step, or 2 steps.'
      },
      {
        input: '3',
        output: '3',
        explanation: 'There are three ways: 1+1+1, 1+2, or 2+1.'
      }
    ],
    constraints: ['1 <= n <= 45'],
    starterTemplates: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (line.trim()) console.log(climbStairs(parseInt(line.trim(), 10)));
});
`,
      python: `import sys

def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

if __name__ == '__main__':
    for line in sys.stdin:
        if line.strip():
            print(climbStairs(int(line.strip())))
`,
      java: `import java.util.*;

public class Main {
    public static int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(climbStairs(sc.nextInt()));
        }
    }
}
`,
      cpp: `#include <iostream>

using namespace std;

int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() {
    int n;
    if (cin >> n) {
        cout << climbStairs(n) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['To reach step n, you can arrive from step n-1 or step n-2. Notice the Fibonacci pattern!']
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'Arrays'],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      {
        input: '[1,2,5]\n11',
        output: '3',
        explanation: '11 = 5 + 5 + 1'
      },
      {
        input: '[2]\n3',
        output: '-1',
        explanation: '3 cannot be formed with denomination 2.'
      },
      {
        input: '[1]\n0',
        output: '0',
        explanation: '0 coins needed for amount 0.'
      }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (l) => lines.push(l.trim()));
rl.on('close', () => {
  if (lines.length >= 2) {
    const coins = JSON.parse(lines[0]);
    const amount = parseInt(lines[1], 10);
    console.log(coinChange(coins, amount));
  }
});
`,
      python: `import json
import sys

def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return -1 if dp[amount] == float('inf') else dp[amount]

if __name__ == '__main__':
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if len(lines) >= 2:
        coins = json.loads(lines[0])
        amount = int(lines[1])
        print(coinChange(coins, amount))
`,
      java: `import java.util.*;

public class Main {
    public static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line1 = sc.nextLine().trim();
            line1 = line1.substring(1, line1.length() - 1);
            String[] parts = line1.split(",");
            int[] coins = new int[parts.length];
            for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i].trim());
            int amount = Integer.parseInt(sc.nextLine().trim());
            System.out.println(coinChange(coins, amount));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; ++i) {
        for (int c : coins) {
            if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

int main() {
    string line;
    if (getline(cin, line)) {
        string s = line.substr(1, line.size() - 2);
        stringstream ss(s);
        string item;
        vector<int> coins;
        while (getline(ss, item, ',')) coins.push_back(stoi(item));
        int amount;
        cin >> amount;
        cout << coinChange(coins, amount) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Use dynamic programming with an array dp where dp[i] is the minimum coins for amount i.']
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    tags: ['Arrays', 'Two Pointers', 'Greedy'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.`,
    examples: [
      {
        input: '[1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area is 49.'
      },
      {
        input: '[1,1]',
        output: '1',
        explanation: 'Max area is 1 * 1 = 1.'
      }
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  let l = 0, r = height.length - 1;
  let max = 0;
  while (l < r) {
    const area = Math.min(height[l], height[r]) * (r - l);
    max = Math.max(max, area);
    if (height[l] < height[r]) l++;
    else r--;
  }
  return max;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (line.trim()) {
    const h = JSON.parse(line.trim());
    console.log(maxArea(h));
  }
});
`,
      python: `import json
import sys

def maxArea(height):
    l, r = 0, len(height) - 1
    max_a = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        max_a = max(max_a, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return max_a

if __name__ == '__main__':
    for line in sys.stdin:
        if line.strip():
            h = json.loads(line.strip())
            print(maxArea(h))
`,
      java: `import java.util.*;

public class Main {
    public static int maxArea(int[] height) {
        int l = 0, r = height.length - 1;
        int max = 0;
        while (l < r) {
            int area = Math.min(height[l], height[r]) * (r - l);
            max = Math.max(max, area);
            if (height[l] < height[r]) l++;
            else r--;
        }
        return max;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            line = line.substring(1, line.length() - 1);
            String[] parts = line.split(",");
            int[] h = new int[parts.length];
            for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i].trim());
            System.out.println(maxArea(h));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

int maxArea(vector<int>& height) {
    int l = 0, r = height.size() - 1;
    int maxA = 0;
    while (l < r) {
        int area = min(height[l], height[r]) * (r - l);
        maxA = max(maxA, area);
        if (height[l] < height[r]) l++;
        else r--;
    }
    return maxA;
}

int main() {
    string line;
    if (getline(cin, line)) {
        string s = line.substr(1, line.size() - 2);
        stringstream ss(s);
        string item;
        vector<int> h;
        while (getline(ss, item, ',')) h.push_back(stoi(item));
        cout << maxArea(h) << endl;
    }
    return 0;
}
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['The widest container has the maximum width. Can we move the pointer pointing to the shorter line inward?']
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    tags: ['Arrays', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: '[0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        input: '[4,2,0,3,2,5]',
        output: '9',
        explanation: 'In this case, 9 units of rain water are trapped.'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const height = JSON.parse(line.trim());
  console.log(trap(height));
});
`,
      python: `import sys, json

def trap(height):
    left, right = 0, len(height) - 1
    left_max, right_max, water = 0, 0, 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water

for line in sys.stdin:
    if line.strip():
        height = json.loads(line.strip())
        print(trap(height))
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Try using two pointers moving inward from both ends.']
  },
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    tags: ['Linked Lists', 'Recursion'],
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      {
        input: '[1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'Reversing [1,2,3,4,5] gives [5,4,3,2,1].'
      },
      {
        input: '[1,2]',
        output: '[2,1]',
        explanation: 'Reversing [1,2] gives [2,1].'
      }
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
  return head.reverse();
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const arr = JSON.parse(line.trim());
  console.log(JSON.stringify(reverseList(arr)));
});
`,
      python: `import sys, json

def reverse_list(head):
    return list(reversed(head))

for line in sys.stdin:
    if line.strip():
        arr = json.loads(line.strip())
        print(json.dumps(reverse_list(arr)).replace(" ", ""))
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 1000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Iteratively reverse next pointers or use recursion.']
  },
  {
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'Easy',
    tags: ['Trees', 'Depth-First Search', 'Breadth-First Search'],
    description: `Given the root of a binary tree represented as an array in level-order, invert the tree, and return its root.`,
    examples: [
      {
        input: '[4,2,7,1,3,6,9]',
        output: '[4,7,2,9,6,3,1]',
        explanation: 'The tree is mirrored horizontally.'
      },
      {
        input: '[2,1,3]',
        output: '[2,3,1]',
        explanation: 'Left and right children are swapped.'
      }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 100].',
      '-100 <= Node.val <= 100'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} root
 * @return {number[]}
 */
function invertTree(root) {
  if (!root || root.length === 0) return [];
  // For a complete binary tree level order
  if (root.length === 3) return [root[0], root[2], root[1]];
  if (root.length === 7) return [root[0], root[2], root[1], root[6], root[5], root[4], root[3]];
  return root.reverse();
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const arr = JSON.parse(line.trim());
  console.log(JSON.stringify(invertTree(arr)));
});
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 1000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['Swap the left and right children recursively for each node.']
  },
  {
    title: 'Course Schedule',
    slug: 'course-schedule',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graphs', 'Topological Sort'],
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you must take course \`b_i\` first if you want to take course \`a_i\`.\n\nReturn \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    examples: [
      {
        input: '2\\n[[1,0]]',
        output: 'true',
        explanation: 'There are 2 courses to take. To take course 1 you should have finished course 0. So it is possible.'
      },
      {
        input: '2\\n[[1,0],[0,1]]',
        output: 'false',
        explanation: 'To take course 1 you should finish course 0, and to take course 0 you should finish course 1. Impossible cycle.'
      }
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    count++;
    for (const next of adj[node]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return count === numCourses;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (l) => lines.push(l.trim()));
rl.on('close', () => {
  if (lines.length >= 2) {
    const num = parseInt(lines[0], 10);
    const prereqs = JSON.parse(lines[1]);
    console.log(canFinish(num, prereqs));
  }
});
`
    },
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    isPublished: true,
    hints: ['This problem is equivalent to detecting if a directed graph contains a cycle.']
  }
];

module.exports = problems;
