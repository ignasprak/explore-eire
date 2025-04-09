
# Explore Eire

This project is a prototype localhost of a next.js 15 application that allows tourists to explore the attractions of Ireland. 

## Demo

Ensure that Node.js and npm are intsalled on the system

This project uses enviroment variables for Supabase and Mapbox configuration. Ensure you have the necessary environment variables set up in a .env.local file.

TO RUN THIS PROJECT

Clone this repository either through the GUI or git clone <insert-my-repository-url-here>

Then do "cd explore-eire"

Then do "npm install" 

Create a .env.local file in the root of the project and add the necessary environment variables for supabase and mapbox.

then do "npm run dev"

NOW you have your developmental server up!

Example .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MAPBOX_API_KEY=your-mapbox-api-key