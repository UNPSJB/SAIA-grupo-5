import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.version_documento.models import VersionDocumento
from src.version_documento import schemas, exceptions

logger = logging.getLogger(__name__)
