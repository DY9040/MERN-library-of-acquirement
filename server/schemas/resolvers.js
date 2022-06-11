const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
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
    saveBook: async (parent, { book }, context) => {
        if (context.user) {
            const updateUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$addToSet: {savedBooks: book } },
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