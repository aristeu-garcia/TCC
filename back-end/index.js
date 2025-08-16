import fs from "fs";
import axios from "axios";
import open from "open";
import readline from "readline";
import express from "express";
import dotenv from "dotenv";
const tokenFile = "./tokens.json";

let accessToken = null;
let refreshToken = null;

let appId = "";
let appSecret = "";
let redirectUri = "";
let accessTokenUrl = "";
let mongoURI = "";
const loadEnv = () => {
  dotenv.config();

  appId = process.env.ML_APP_ID;
  appSecret = process.env.ML_APP_SECRET;
  redirectUri = process.env.ML_REDIRECT_URL;
  accessTokenUrl = process.env.ML_ACCESS_TOKEN_URL;
  mongoURI = process.env.MONGO_URI;
  const required = { appId, appSecret, redirectUri, accessTokenUrl, mongoURI };
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`❌ Variável de ambiente ${key} não definida`);
    }
  }
};
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // especificar explicitamente
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
const port = 3001;
let client = null;

//https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=4342041251585295&redirect_uri=https://httpbin.org/get
// ⚠️ Não use tokens hardcoded se puder evitar. Pegue dinamicamente.

const database = "TCC2";

app.get("/categories", async (req, res) => {
  const categories = await listCategories();
  res.json(categories);
});

app.delete("/categories", async (req, res) => {
  await deleteManyCategories();
  res.sendStatus(200);
});
app.delete("/children-categories", async (req, res) => {
  await deleteManyChildrenCategories();
  res.sendStatus(200);
});

app.put("/refresh-categories", async (req, res) => {
  console.log("[PUT] Refreshing categories...");
  await refreshCategories();
  res.sendStatus(200);
});

const findCategoryByMlCategoryId = async (mlCategoryId) => {
  const categoriesCollection = client.db(database).collection("categories");
  const category = await categoriesCollection.findOne({
    ml_category_id: mlCategoryId,
    $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }],
  });
  return category;
};

const findChildrenCategoryByMlCategoryId = async (mlCategoryId) => {
  const childrenCategoriesCollection = client
    .db(database)
    .collection("children_categories");
  const category = await childrenCategoriesCollection.findOne({
    id: mlCategoryId,
    $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }],
  });
  return category;
};

const deleteChildrenCategoryByMlCategoryId = async (mlCategoryId) => {
  const childrenCategoriesCollection = client
    .db(database)
    .collection("children_categories");
  await childrenCategoriesCollection.updateOne({
    id: mlCategoryId,
    deleted_at: new Date(),
  });
};

const insertCategory = async (category) => {
  const categoriesCollection = client.db(database).collection("categories");
  await categoriesCollection.insertOne(category);
};

const insertChildrenCategory = async (category) => {
  const childrenCategoriesCollection = client
    .db(database)
    .collection("children_categories");
  await childrenCategoriesCollection.insertOne(category);
};

const deleteCategoryByMlCategoryId = async (mlCategoryId) => {
  const categoriesCollection = client.db(database).collection("categories");
  await categoriesCollection.updateOne({
    ml_category_id: mlCategoryId,
    deleted_at: new Date(),
  });
};

const updateChildrenCategory = async (category) => {
  const childrenCategoriesCollection = client
    .db(database)
    .collection("children_categories");
  await childrenCategoriesCollection.updateOne(
    { id: category.id },
    { $set: category }
  );
};

const getCategories = async (accessToken) => {
  const url = "https://api.mercadolibre.com/sites/MLB/categories";

  const response = await axios.get(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
const getCategoryDetails = async (accessToken) => {
  const categories = await getCategories(accessToken);

  const promises = categories.map((category) =>
    axios.get(`https://api.mercadolibre.com/categories/${category.id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${accessToken}`,
      },
    })
  );

  const results = await Promise.all(promises);
  return results.map((r) => r.data);
};

const updateCategory = async (category) => {
  const categoriesCollection = client.db(database).collection("categories");
  await categoriesCollection.updateOne(
    { ml_category_id: category.id },
    { $set: category }
  );
};

const refreshCategories = async () => {
  const mlCategories = await getCategoryDetails(accessToken);
  const { categories, children_categories } = await parsedCategories(
    mlCategories
  );

  categories.forEach(async (category) => {
    const categoryAlreadyExistsInCategories = await findCategoryByMlCategoryId(
      category.id
    );
    const categoryAlreadyExistsInChildrenCategories =
      await findChildrenCategoryByMlCategoryId(category.id);

    if (
      !categoryAlreadyExistsInCategories &&
      !categoryAlreadyExistsInChildrenCategories
    ) {
      await insertCategory(category);
    }
    if (
      categoryAlreadyExistsInChildrenCategories &&
      !categoryAlreadyExistsInCategories
    ) {
      await deleteChildrenCategoryByMlCategoryId(category);
      await insertCategory(category);
    }
    if (categoryAlreadyExistsInCategories) {
      await updateCategory(category);
    }
  });

  children_categories.forEach(async (category) => {
    const categoryAlreadyExistsInChildrenCategories =
      await findChildrenCategoryByMlCategoryId(category.id);
    const categoryAlreadyExistsInCategories = await findCategoryByMlCategoryId(
      category.id
    );

    if (
      !categoryAlreadyExistsInChildrenCategories &&
      !categoryAlreadyExistsInCategories
    ) {
      await insertChildrenCategory(category);
    }
    if (
      !categoryAlreadyExistsInChildrenCategories &&
      categoryAlreadyExistsInCategories
    ) {
      await deleteCategoryByMlCategoryId(category.id);
      await insertChildrenCategory(category);
    }
    if (categoryAlreadyExistsInChildrenCategories) {
      await updateChildrenCategory(category);
    }
  });
};

const connectMongoDB = async () => {
  console.log("Conectando ao banco de dados...");
  client = new MongoClient(mongoURI);
  await client.connect();
  console.log("Conectado ao banco de dados");
  return client;
};

const listCategories = async () => {
  const categoriesCollection = client.db(database).collection("categories");
  const categories = await categoriesCollection
    .find({
      $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }],
    })
    .toArray();
  return categories;
};
const saveTokens = (data) => {
  fs.writeFileSync(tokenFile, JSON.stringify(data, null, 2));
};

const loadTokens = () => {
  if (fs.existsSync(tokenFile)) {
    const data = JSON.parse(fs.readFileSync(tokenFile));
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
  }
};

const getAccessToken = async (authorizationCode) => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: appId,
    client_secret: appSecret,
    code: authorizationCode,
    redirect_uri: redirectUri,
  });

  const { data } = await axios.post(accessTokenUrl, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  saveTokens(data);
  console.log("Token obtido:", data.access_token);
};

const refreshAccessToken = async () => {
  if (!refreshToken) throw new Error("Nenhum refresh token salvo");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: appId,
    client_secret: appSecret,
    refresh_token: refreshToken,
  });

  const { data } = await axios.post(accessTokenUrl, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  accessToken = data.access_token;
  refreshToken = data.refresh_token || refreshToken;
  saveTokens({ access_token: accessToken, refresh_token: refreshToken });
  console.log("Token renovado:", data.access_token);
};

const askCodeInTerminal = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      "Cole aqui o código de autorização (code) e pressione Enter:\n",
      (code) => {
        rl.close();
        resolve(code.trim());
      }
    );
  });
};

const startAuthFlow = async () => {
  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}`;
  console.log("Abrindo navegador para autenticação...");
  console.log("Caso o navedor não abra, copie e cole esse link:", authUrl);
  await open(authUrl);

  const code = await askCodeInTerminal();
  if (!code) {
    console.error("Código de autorização não informado!");
    process.exit(1);
  }

  await getAccessToken(code);
};
const getUserInfo = async (accessToken) => {
  const url = "https://api.mercadolibre.com/users/me";
  const response = await axios.get(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
};
const insertCategories = async (categories) => {
  const categoriesCollection = client.db(database).collection("categories");
  await categoriesCollection.insertMany(categories);
};
const deleteManyChildrenCategories = async () => {
  const childrenCategoriesCollection = client
    .db(database)
    .collection("children_categories");
  await childrenCategoriesCollection.deleteMany({});
};

const deleteManyCategories = async () => {
  const categoriesCollection = client.db(database).collection("categories");
  await categoriesCollection.deleteMany({});
};
const parsedCategories = (categories) => {
  const categoriesParsed = categories.map((category) => {
    return {
      id: category.id,
      name: category.name,
      path_from_root: category.path_from_root,
      permalink: category.permalink,
      total_items_in_this_category: category.total_items_in_this_category,
      path_from_root: category.path_from_root,
      date_created: category.date_created,
    };
  });
  const childrenCategories = [];
  categories.forEach((category) => {
    const children = category.children_categories.map((child) => {
      return {
        ...child,
        root_category_id: category.id,
      };
    });
    childrenCategories.push(...children);
  });
  return {
    categories: categoriesParsed,
    children_categories: childrenCategories,
  };
};
const insertChildrenCategories = async (categories) => {
  const childrenCategoriesCollection = client
    .db(database)
    .collection("children_categories");
  await childrenCategoriesCollection.insertMany(categories);
};
const isAuthenticated = async () => {
  try {
    const response = await getUserInfo(accessToken);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const init = async () => {
  loadEnv();
  loadTokens();
  const isValidToken = await isAuthenticated();
  console.log("isValidToken", isValidToken);
  if (!accessToken || !isValidToken) {
    await startAuthFlow();
  } else {
    console.log("Usando token salvo:", accessToken);
  }
  await connectMongoDB();
};

app.listen(port,  () => {
  init();
  console.log(`Servidor rodando na porta ${port}`);
});
