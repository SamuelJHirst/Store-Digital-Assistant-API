import { hash } from 'bcrypt';
import { Counter } from '../entities/Counter';
import { Site } from '../entities/Site';
import { User } from '../entities/User';

export const init = async (): Promise<void> => {
	const users = await User.countDocuments({});
	const sites = await Site.countDocuments({});
	if (users === 0 && sites === 0) {
		const newSite = new Site({
			code: 1000,
			name: 'First Store',
			type: 'Store'
		});
		await newSite.save().then(async (site) => {
			const password = await hash('password', 10);
			const newUser = new User({
				firstName: 'Default',
				lastName: 'User',
				username: 'admin',
				password: password,
				userType: 'Admin',
				site: site._id
			});
			await newUser.save();
		});	
		Counter.insertMany([ { seq: 1000000000 }, { seq: 2000000000 }, { seq: 3000000000 } ]);
	}
};