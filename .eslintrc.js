module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react/jsx-uses-react': 'off', // Disable this rule for React 17+ (new JSX transform)
    'react/react-in-jsx-scope': 'off', // React is not required to be in scope with the new JSX transform
    'react/jsx-uses-vars': 'error',
  },
};
