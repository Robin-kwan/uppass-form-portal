#Live on
https://uppass-form-portal-e79p.vercel.app/

#To run the project locally
- `npm install`
- `npm run dev`

#Schema updates
Please refer to `app/assets/updated_schema.json`
- Moved 'days' inside of 'items'
- Moved 'required' outside of 'rule' as a key itself and accepts a boolean
- Moved other rules from 'props' to 'rules'
- Added hint for text and number inputs
- Added endpoint URL for submit function
- Added min and negative number support for number input
- Added Select to supported components

#Additional features
- Using states to store data between pages
- Allow saving schemas using localStorage
- Homepage

#Thought Process.
1. Planned and enhanced Schema.json structure. For more info, please refer to 'Schema updates' above
2. Manually set up the project to avoid dependency conflicts later
3. Initialized the project using the instructions given
4. Built the key features
5. Added more features ie. new supported component, and more props to the components
6. Tested all features are working fine
7. Improved the design for better user-friendliness
8. Cleaned code & Refactor duplicates
9. Test all features again
10. Implemented unit testing


