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
3. Built the key features
4. Added more features ie. new supported component, and more props to the components
5. Tested all features are working fine
6. Improved the design. Created the homepage and introduced features on the page
7. Cleaned code, refactored, and fixed Typescript errors 
8. Test all features again
9. Implemented unit testing

#Timespent
- Planning 1hr
- Coding functional 8hr
- Coding design 3hr
- Deploy 30m
- Document 30m
- `Total 13hr`


