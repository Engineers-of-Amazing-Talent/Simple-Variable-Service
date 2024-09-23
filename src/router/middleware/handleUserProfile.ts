import { Response, Request, NextFunction } from 'express';
import repository, { UserProfileInstance } from '../../model';

export async function handleUserProfile(request: Request, response: Response, next: NextFunction) {
  try {
    const { user } = request;
    if (!user) {
      next({ message: 'Unauthorized Request', status: 401 });
    } else {
      const UserProfiles = repository.getModel<UserProfileInstance>('UserProfile');
      let userProfile = await UserProfiles.findOne({ where: { externalId: user.id }});
      if (!userProfile) {
        userProfile = await UserProfiles.create({
          externalId: user.id
        });
      }
      request.profile = userProfile;
      next();
    }
  } catch (e) {
    next({message:'User Profile Error:unable to process user profile', status: 500 });
  }
}