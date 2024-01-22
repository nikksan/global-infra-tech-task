import News, { ConstructorParams } from '@domain/model/News';

export default class NewsFactory {
  create(override: Partial<ConstructorParams> = {}): News {
    const defaults: ConstructorParams = {
      title: 'Lorem',
      shortDescription: 'lorem ipsum',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
    };

    return new News({
      ...defaults,
      ...override,
    });
  }
}
