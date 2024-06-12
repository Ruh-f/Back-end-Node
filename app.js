const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const knex = require('knex');

const knexfile = require('./knexfile');

const bd = knex(knexfile)

function resSuccess(res, data) {
  return res.json({ status: "success", data });
}

function resError(res, statusCode, message) {
  return res.status(statusCode).json({ status: "error", message });
}

function requiredFields(fields) {
  return fields.every((field) => field !== undefined && field !== null);
}


app.post('/usuarios',  async (req, res) => {
  const { nome, email, senha } = req.body;

    if (!requiredFields([nome, email, senha])) {
        return resError(res, 400, "Campos obrigatórios não preenchidos.");
    }

    try {
        await bd('usuario').insert({ nome, email, senha });
        resSuccess(res, "Usuário criado com sucesso!");
    } catch (error) {
        console.error(error);
        resError(res, 500, "Falha ao criar usuário.");
    }
});

app.get('/', async (req, res) => {
  return res.send('Olá mundo')
})

app.get('/usuarios', async (req, res) => {  
  try {
    const Usuario = await bd('usuario').select();
    console.log('Dados recuperados:', Usuario); 
    // Formatando datas ou outras manipulações necessárias
    resSuccess(res, Usuario);
     } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar usuários.");
      }
  });

app.get('/usuarios/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const Usuario = await bd('usuario').where('id', id).first();
    console.log('Dados recuperados:', Usuario); 
    
    resSuccess(res, Usuario);
      } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar usuários.");
      }

});

app.put('/usuarios/:id', async (req, res) => {

  const id = req.params.id; 
  const { nome, email, senha } = req.body;

    
    console.log(`user_id: ${id}, Username: ${nome}, Email: ${email}`, `Senha: ${senha}`);

    if (!requiredFields([nome, email, senha])) {
        return resError(res, 400, "Campos obrigatórios não preenchidos.");
    }

    try {
        
        console.log('Tentando atualizar o usuário no banco de dados.');

        const updated = await bd('usuario').where('id', id).update({ nome, email, senha }); // Altere para 'user_id'

        
        console.log(`Registros atualizados: ${updated}`);

        if (updated) {
            resSuccess(res, "Usuário atualizado com sucesso.");
        } else {
            resError(res, 404, "Usuário não encontrado.");
        }
    } catch (error) {
        console.error(error);
        resError(res, 500, "Falha ao atualizar usuário.");
    }

});

app.delete('/usuarios/:id', async (req, res) => {

  const id = req.params.id; 
    try {
        const deleted = await bd('usuario').where('id', id).del(); // Altere para 'user_id'
        if (deleted) {
            resSuccess(res, "Usuário excluído com sucesso.");
        } else {
            resError(res, 404, "Usuário não encontrado.");
        }
    } catch (error) {
        console.error(error);
        resError(res, 500, "Falha ao deletar usuário.");
    }

});

// Postagens

app.post('/postagens', async (req, res) => {
  const { id, titulo, conteudo, id_usuario } = req.body; 
  const data_criacao = new Date();

  if (!requiredFields([id, titulo, conteudo, id_usuario])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    await bd('postagem').insert({ id, titulo, conteudo, id_usuario, data_criacao });
    resSuccess(res, "Postagem criada com sucesso!");
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao criar postagem.");
  }
});

app.get('/postagens', async (req, res) => {
  try {
    const postagens = await bd('postagem').select();
    resSuccess(res, postagens);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar postagens.");
  }
});

app.get('/usuarios/:id/postagens', async (req, res) => {
  const idUsuario = req.params.id;
  try {
    const postagens = await bd('postagem').where('id_usuario', idUsuario).select();
    resSuccess(res, postagens);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar postagens do usuário.");
  }
});

app.put('/postagens/:id', async (req, res) => {
  const id = req.params.id;
  const { titulo, conteudo, id_usuario } = req.body;

  if (!requiredFields([titulo, conteudo, id_usuario])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    const updated = await bd('postagem').where('id', id).update({ titulo, conteudo, id_usuario });
    if (updated) {
      resSuccess(res, "Postagem atualizada com sucesso.");
    } else {
      resError(res, 404, "Postagem não encontrada.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao atualizar postagem.");
  }
});

app.delete('/postagens/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await bd('postagem').where('id', id).del();
    if (deleted) {
      resSuccess(res, "Postagem excluída com sucesso.");
    } else {
      resError(res, 404, "Postagem não encontrada.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao excluir postagem.");
  }
});


//Comentarios

app.post('/comentarios', async (req, res) => {
  const { id, texto, id_usuario, id_postagem } = req.body;
  const data_comentario = new Date();
  if (!requiredFields([id, texto, id_usuario, id_postagem])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    await bd('comentario').insert({ id, texto, id_usuario, id_postagem, data_comentario });
    resSuccess(res, "Comentário criado com sucesso!");
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao criar comentário.");
  }
});

app.get('/postagens/:id/comentarios', async (req, res) => {
  const id_postagem = req.params.id;

  try {
    const comentarios = await bd('comentario').where('id_postagem', id_postagem).select();
    resSuccess(res, comentarios);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar comentários da postagem.");
  }
});

app.put('/comentarios/:id', async (req, res) => {
  const idComent = req.params.id;
  const { id, texto, id_usuario, id_postagem } = req.body;

  if (!requiredFields([id, texto, id_usuario, id_postagem])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    const updated = await bd('comentario').where('id', idComent).update({ id, texto, id_usuario, id_postagem });
    if (updated) {
      resSuccess(res, "Comentário atualizado com sucesso.");
    } else {
      resError(res, 404, "Comentário não encontrado.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao atualizar comentário.");
  }
});

app.delete('/comentarios/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await bd('comentario').where('id', id).del();
    if (deleted) {
      resSuccess(res, "Comentário excluído com sucesso.");
    } else {
      resError(res, 404, "Comentário não encontrado.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao excluir comentário.");
  }
});

// Curtidas

app.post('/curtidas', async (req, res) => {
  const { id, id_usuario, id_postagem } = req.body;

  if (!requiredFields([ id, id_usuario, id_postagem])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    await bd('curtida').insert({ id, id_usuario, id_postagem });
    resSuccess(res, "Curtida registrada com sucesso!");
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao registrar curtida.");
  }
});

app.get('/postagens/:id/curtidas', async (req, res) => {
  const id_postagem = req.params.id;

  try {
    const curtidas = await bd('curtida').where('id_postagem', id_postagem).select();
    resSuccess(res, curtidas);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar curtidas da postagem.");
  }
});

app.delete('/curtidas/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await bd('curtida').where('id', id).del();
    if (deleted) {
      resSuccess(res, "Curtida removida com sucesso.");
    } else {
      resError(res, 404, "Curtida não encontrada.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao remover curtida.");
  }
});

// Seguidor

app.post('/seguidores', async (req, res) => {
  const { id, id_seguidor, id_usuario } = req.body;

  if (!requiredFields([id, id_seguidor, id_usuario])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    await bd('seguidor').insert({ id, id_seguidor, id_usuario });
    resSuccess(res, "Seguidor criado com sucesso!");
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao criar seguidor.");
  }
});


app.get('/usuarios/:id/seguidores', async (req, res) => {
  const id_usuario = req.params.id;

  try {
    const seguidores = await bd('seguidor').where('id_usuario', id_usuario).select();
    resSuccess(res, seguidores);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar seguidores do usuário.");
  }
});


app.delete('/seguidores/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await bd('seguidor').where('id', id).del();
    if (deleted) {
      resSuccess(res, "Seguidor removido com sucesso.");
    } else {
      resError(res, 404, "Seguidor não encontrado.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao remover seguidor.");
  }
});

// Hashtag

app.post('/hashtags', async (req, res) => {
  const { id, tag } = req.body;

  if (!requiredFields([id, tag])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    await bd('hashtag').insert({ id, tag });
    resSuccess(res, "Hashtag criada com sucesso!");
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao criar hashtag.");
  }
});

app.get('/hashtags', async (req, res) => {
  try {
    const hashtags = await bd('hashtag').select();
    resSuccess(res, hashtags);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar hashtags.");
  }
});

// Perfil

// Rota para criar um perfil
app.post('/perfis', async (req, res) => {
  const { id, id_usuario, descricao, foto_perfil} = req.body;

  if (!requiredFields([id, id_usuario, descricao, foto_perfil])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    await bd('perfil').insert({ id, id_usuario, descricao, foto_perfil });
    resSuccess(res, "Perfil criado com sucesso!");
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao criar perfil.");
  }
});

app.get('/usuarios/:id/perfis', async (req, res) => {
  const id_usuario = req.params.id;

  try {
    const perfis = await bd('perfil').where('id_usuario', id_usuario).select();
    resSuccess(res, perfis);
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao listar perfis do usuário.");
  }
});


app.put('/perfis/:id', async (req, res) => {
  const idPerfil = req.params.id;
  const { id, id_usuario, descricao, foto_perfil } = req.body;

  if (!requiredFields([id, id_usuario, descricao, foto_perfil])) {
    return resError(res, 400, "Campos obrigatórios não preenchidos.");
  }

  try {
    const updated = await bd('perfil').where('id', idPerfil).update({ id, id_usuario, descricao, foto_perfil });
    if (updated) {
      resSuccess(res, "Perfil atualizado com sucesso.");
    } else {
      resError(res, 404, "Perfil não encontrado.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao atualizar perfil.");
  }
});

app.delete('/perfis/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await bd('perfil').where('id', id).del();
    if (deleted) {
      resSuccess(res, "Perfil removido com sucesso.");
    } else {
      resError(res, 404, "Perfil não encontrado.");
    }
  } catch (error) {
    console.error(error);
    resError(res, 500, "Falha ao remover perfil.");
  }
});

///


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});
