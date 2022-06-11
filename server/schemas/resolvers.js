const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { sToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('savedBooks');

                return userData;
            }
            throw new AuthenticationError('You must be logged in to access this data');
        },
        //gets all users
        users: async () => {
            return User.find()
            .select('-__v -password')
            .populate('savedBooks');
        },
        //gets a single user by Username
        user: async (parent, { username }) => {
            return User.findOne({ username })
            .select('-__v -password')
            .populate('savedBooks');
        }
},
Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = sToken(user);
        return { token, user };
    },
    login: async (parent, {email, password}) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthenticationError('Invalid credentials');
    }
    const correctPassword = await user.isCorrectPassword(password);
    if (!correctPassword) {
        throw new AuthenticationError('Invalid credentials');
    }
    const token = sToken(user);
    return { token, user };
    },
    saveBook: async (parent, { user, body }, context) => {
        if (!context.user) {
            const updateUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
            );

            await User.findByIdAndUpdate(
                {_id: context.user._id},
                {$push: {thoughts: thought._id } },
                { new: true } 
            );

            return updateUser;

            }
            throw new AuthenticationError('You must be logged in to access this data');
    },
    deleteBook: async (parent, { user, params }, context) => {
        if (context.user) {
            const updateUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: params.bookId } } },
                { new: true }
            );
            return updateUser;
            }
            throw new AuthenticationError('You must be logged in to access this data');
            }
        }
    }

    module.exports = resolvers;