import {Model, ModelStatic, Sequelize} from 'sequelize';

type AnyModel = Model<Record<string, any>, Record<string, any>>;
type AnyModelStatic = ModelStatic<AnyModel>;

declare const db: {
    User: AnyModelStatic;
    Post: AnyModelStatic;
    Story: AnyModelStatic;
    Comment: AnyModelStatic;
    Tag: AnyModelStatic;
    Post_Tag: AnyModelStatic;
    Like: AnyModelStatic;
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
};

export = db;
