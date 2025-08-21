# Como Criar Usuários no Sistema IAM

## Visão Geral
O sistema IAM (Identity and Access Management) permite gerenciar usuários e suas permissões dentro da clínica. Existem três tipos de papéis disponíveis:

- **Admin**: Acesso completo ao sistema
- **Psicólogo**: Pode gerenciar consultas, criar relatórios e visualizar pacientes
- **Recepção**: Pode agendar consultas e gerenciar pacientes

## Como Adicionar um Novo Usuário

### Pré-requisitos
1. O usuário deve **primeiro se cadastrar** no sistema usando a página de autenticação
2. O usuário deve ter um email válido
3. Você deve ser um administrador da clínica

### Passos para Adicionar

1. **Acesse a página IAM**
   - Navegue para `/iam` no sistema
   - Clique no botão "Adicionar usuário"

2. **Preencha o formulário**
   - **Email**: Digite o email do usuário que já se cadastrou no sistema
   - **Papel**: Selecione o papel apropriado (Admin, Psicólogo, Recepção)

3. **Confirme a adição**
   - Clique em "Adicionar à clínica"
   - O sistema verificará se o usuário existe
   - Se tudo estiver correto, o usuário será vinculado à sua clínica

### Funcionalidades por Papel

#### Psicólogo
- Criar e editar relatórios de consultas
- Visualizar seus próprios agendamentos
- Acessar dados de pacientes relacionados às suas consultas

#### Recepção
- Agendar consultas
- Gerenciar cadastro de pacientes
- Visualizar agenda da clínica

#### Admin
- Todas as funcionalidades acima
- Gerenciar usuários (IAM)
- Configurações da clínica

## Fluxo de Trabalho com Relatórios

### Para Psicólogos
1. Acesse a página "Relatórios"
2. Clique em "Novo Relatório"
3. **Selecione uma consulta** da lista de agendamentos
   - O sistema mostra apenas consultas onde você é o profissional responsável
   - Cada consulta mostra: nome do paciente + data/hora
4. Preencha o título e conteúdo do relatório
5. Use o editor de texto rico para formatar o conteúdo
6. Salve o relatório

### Recursos do Editor de Relatórios
- **Formatação**: Negrito, itálico, listas
- **Seleção automática**: Ao escolher uma consulta, o paciente é selecionado automaticamente
- **Validação**: Não é possível criar relatório sem selecionar uma consulta

## Troubleshooting

### "Usuário não encontrado"
- O usuário precisa se cadastrar primeiro no sistema
- Verifique se o email está correto

### "Usuário já está vinculado a esta clínica"
- O usuário já faz parte da sua clínica
- Verifique na lista de usuários existentes

### "Nenhuma consulta encontrada" (ao criar relatório)
- O psicólogo precisa ter consultas agendadas
- Verifique se há appointments na agenda do médico
- **Nota**: Atualmente estamos em transição do sistema, então pode ser necessário configurar a ligação entre usuários e doctors

## Próximos Passos de Desenvolvimento

1. **Migração do banco**: Aplicar a migração para remover `patient_professional_links`
2. **Vincular Users e Doctors**: Criar relação entre tabela `users` e `doctors`
3. **Implementar busca de appointments**: Atualizar `getUserAppointments` para retornar dados reais
4. **Testes end-to-end**: Verificar todo o fluxo de criação de relatórios
