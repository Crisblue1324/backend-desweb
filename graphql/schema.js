const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLID, GraphQLNonNull } = require("graphql");
const User = require("../models/user");

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        dni: { type: GraphQLString },
        nombres: { type: GraphQLString },
        apellidos: { type: GraphQLString },
        fechaNacimiento: { type: GraphQLString },
        genero: { type: GraphQLString },
        ciudad: { type: GraphQLString },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find();
            },
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args.id);
            },
        },
        usersByCity: {
            type: new GraphQLList(UserType),
            args: { ciudad: { type: GraphQLString } },
            resolve(parent, args) {
                return User.find({ ciudad: args.ciudad });
            },
        },
    },
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                dni: { type: new GraphQLNonNull(GraphQLString) },
                nombres: { type: new GraphQLNonNull(GraphQLString) },
                apellidos: { type: new GraphQLNonNull(GraphQLString) },
                fechaNacimiento: { type: new GraphQLNonNull(GraphQLString) },
                genero: { type: new GraphQLNonNull(GraphQLString) },
                ciudad: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                const user = new User(args);
                return user.save();
            },
        },
        deleteUser: {
            type: UserType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return User.findByIdAndDelete(args.id);
            },
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                nombres: { type: GraphQLString },
                apellidos: { type: GraphQLString },
                ciudad: { type: GraphQLString },
            },
            async resolve(parent, args) {
                const { id, ...updates } = args;
                return await User.findByIdAndUpdate(id, updates, { new: true });
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
