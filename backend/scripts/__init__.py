# Registra todos los modelos de SQLAlchemy antes de que cualquier seed haga
# una consulta. Sin esto, correr un seed suelto (python -m scripts.seed_x)
# falla al resolver relaciones declaradas como string (ej. 'PedidoProveedor').
import src.all_models  # noqa: F401
