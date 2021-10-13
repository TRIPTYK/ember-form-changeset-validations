import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import Store from '@ember-data/store';
import { toPojo } from 'ember-form-changeset-validations/utils/to-pojo';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import ArticleValidation from '../../../validator/forms/articles';

export default class ArticlesEdit extends Route {
  @inject declare store: Store;

  async model({ id }: { id: string }) {
    const article = await this.store.findRecord('article', id, {
      include: 'comments,author,image',
    });
    const pojo = toPojo(article, this.store) as Record<string, unknown>;

    // pojoize image relationship
    pojo.image = pojo.image
      ? toPojo(this.store.peekRecord('image', pojo.image as string), this.store)
      : null;

    // pojoize comments relationship
    pojo.comments = (pojo.comments as string[]).map((e) =>
      toPojo(this.store.peekRecord('comment', e)!, this.store)
    );

    const changeset = Changeset(
      pojo,
      lookupValidator(ArticleValidation),
      ArticleValidation
    );

    return {
      article,
      changeset,
    };
  }
}
