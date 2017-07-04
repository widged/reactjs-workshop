As the project gains in complexity, it is important to spend some time on defining a better file structure.

The approach I like to take is to move all files that have something to do with deployment into a `usage` subfolder. The purpose of the files in that folder is to provide an example of usage of the reactjs files in the project. They are typically tied to specific build/transpiling config options. Here these options are managed by nwb and configured in nwb.config.js. If I decide to change of solution for working on the development of reactjs components, migrate from nwb to react-create-app, I only have to add a new subfolder or change the content of the usage subfolder.

This means that you now have to do:

      cd path/to/step_4/usage
      npm run start


It also is best practice to move any component to a separate file. So I moved the JournalingCard component to a separate file. By convention, always use the same name for the component class and the component file.
